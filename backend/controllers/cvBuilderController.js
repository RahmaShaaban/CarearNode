const { UserCVData, Template } = require('../models/index');
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});
// دالة الـ Preview المعدلة
exports.previewCV = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. جلب البيانات من الداتابيز
        const cvData = await UserCVData.findByPk(id);

        if (!cvData) {
            return res.status(404).send('الـ CV ده مش موجود');
        }

        // 2. تنظيف البيانات قبل العرض (عشان علامات التنصيص)
        const sanitizedSummary = cvData.summary ? cvData.summary.replace(/^["']|["']$/g, '') : '';
        
        // 3. رندر القالب الجديد (modern_ats)
        res.render('modern_ats', { 
            personal_info: cvData.personal_info || {},
            summary: sanitizedSummary,
            experience: cvData.experience || [],
            education: cvData.education || [],
            skills: cvData.skills || [],
            projects: cvData.custom_sections || [], // لو عندك داتا للمشاريع
            template_settings: cvData.template_settings || { color: '#003366', font: 'Arial' } 
        });

    } catch (error) {
        console.error("Preview Error:", error);
        res.status(500).send("خطأ في عرض الـ CV");
    }
};
exports.getTemplates = async (req, res) => {
    try {
        // بنستخدم findAll بتاعة Sequelize عشان نجيب الداتا من الجدول اللي إنتي عملتيه
        const allTemplates = await Template.findAll({
            where: { is_active: true }, // لو عندك عمود بيحدد القالب شغال ولا لأ
            attributes: ['id', 'name', 'preview_image', 'layout_type'] // الأعمدة اللي محتاجينها
        });

        res.status(200).json({
            success: true,
            data: allTemplates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching templates from database",
            error: error.message
        });
    }
};
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.downloadCVAsPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const cvData = await UserCVData.findByPk(id);

        if (!cvData) return res.status(404).send('الـ CV ده مش موجود');

        // 1. تحديد مسار ملف الـ EJS
        const templatePath = path.join(__dirname, '../templates/modern_ats.ejs');

        // 2. تحويل الـ EJS لـ HTML نصي (Data + Template)
        const html = await ejs.renderFile(templatePath, {
            personal_info: cvData.personal_info || {},
            summary: cvData.summary ? cvData.summary.replace(/^["']|["']$/g, '') : '',
            experience: cvData.experience || [],
            education: cvData.education || [],
            skills: cvData.skills || [],
            projects: cvData.custom_sections || [],
            template_settings: cvData.template_settings || { color: '#003366', font: 'Arial' }
        });

        // 3. تشغيل Puppeteer لتحويل الـ HTML لـ PDF
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // ضبط المحتوى والانتظار حتى تحميل كل شيء (الصور والخطوط)
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // مهم جداً عشان الألوان تظهر
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        // 4. إرسال الملف لليوزر كـ Download
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=CV_${cvData.id}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).send("خطأ أثناء استخراج ملف الـ PDF");
    }
};
exports.createCVFromScratch = async (req, res) => {
    try {
        const { 
            userId, personalInfo, experience, education, 
            skills, customSections, summary, templateId, templateSettings 
        } = req.body;

        console.log("🚀 Starting Full AI Optimization for User:", userId);

        // --- 1. تحسين الـ Summary ---
        let finalSummary = summary;
        if (summary && summary.trim() !== "") {
            try {
                const response = await cohere.chat({
                    model: "command-r-08-2024",
                    message: `Professional CV Summary for: "${summary}". Return ONLY the rewritten text.`,
                });
                if (response?.text) finalSummary = response.text.trim();
            } catch (err) { console.error("⚠️ Summary AI Error:", err.message); }
        }

        // --- 2. تحسين الـ Experience Roles (Loop) ---
        let optimizedExperience = [...experience]; // نأخذ نسخة من المصفوفة
        if (experience && Array.isArray(experience)) {
            for (let i = 0; i < optimizedExperience.length; i++) {
                if (optimizedExperience[i].role) {
                    try {
                        console.log(`⏳ Optimizing Role ${i+1}: ${optimizedExperience[i].role}`);
                        const expResponse = await cohere.chat({
                            model: "command-r-08-2024",
                            message: `Rewrite this job role professionally for a CV: "${optimizedExperience[i].role}". Return ONLY the text.`,
                        });
                        if (expResponse?.text) {
                            optimizedExperience[i].role = expResponse.text.trim();
                        }
                    } catch (err) {
                        console.error(`⚠️ Experience AI Error at index ${i}:`, err.message);
                    }
                }
            }
        }

        // --- 3. الحفظ في الداتابيز ---
        // لاحظي: التعليم والمهارات هينزلوا زي ما هم (Education, Skills)
        const newCVData = await UserCVData.create({
            user_id: userId,
            personal_info: personalInfo,
            experience: optimizedExperience, // النسخة المحسنة
            education: education,            // كما هي
            skills: skills,                  // كما هي
            custom_sections: customSections,
            summary: finalSummary,           // النسخة المحسنة
            selected_template_id: templateId,
            template_settings: templateSettings
        });

        return res.status(201).json({
            success: true,
            message: "تم تحسين الـ Summary والـ Experience وحفظ البيانات",
            data: newCVData
        });

    } catch (error) {
        console.error("🔥 Controller Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};