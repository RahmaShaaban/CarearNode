// 1. التعديل المهم هنا: استدعاء الموديلات من ملف الاندكس المجمع
const { UserCVData, Template, User } = require('../models'); 
const axios = require('axios');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

async function optimizeWithGroq(text, type) {
    if (!text || text.trim() === "") return text;
    try {
        const prompt = type === 'summary' 
            ? `Rewrite this CV summary to be highly professional and ATS-friendly: "${text}". Return ONLY the text.`
            : `Rewrite this job responsibility/role to be professional, using action verbs: "${text}". Return ONLY the text.`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
        });
        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error(`⚠️ Groq ${type} Error:`, err.message);
        return text;
    }
}

exports.createCVFromScratch = async (req, res) => {
    try {
        const { userId, personalInfo, experience, education, skills, customSections, summary, templateId, templateSettings } = req.body;
        const optimizedSummary = await optimizeWithGroq(summary, 'summary');
        let optimizedExperience = [];
        if (experience && Array.isArray(experience)) {
            optimizedExperience = await Promise.all(experience.map(async (exp) => ({
                ...exp,
                role: await optimizeWithGroq(exp.role, 'experience')
            })));
        }
        const newCVData = await UserCVData.create({
            user_id: userId,
            personal_info: personalInfo,
            experience: optimizedExperience,
            education: education,
            skills: skills,
            custom_sections: customSections,
            summary: optimizedSummary,
            selected_template_id: templateId,
            template_settings: templateSettings
        });

        // ربط الـ CV الجديد ببروفايل اليوزر
        if (User) {
            await User.update(
                { cv_id: newCVData.id }, 
                { where: { id: userId } }
            );
        }

        res.status(201).json({ success: true, data: newCVData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.previewCV = async (req, res) => {
    try {
        const { id } = req.params;
        // التأكد من استخدام include صحيح مع الـ Alias المعرف في index.js
        const cvData = await UserCVData.findByPk(id, { 
            include: [{ model: Template, as: 'template' }] 
        });

        if (!cvData) return res.status(404).send('الـ CV مش موجود');

        const templateName = cvData.template?.layout_type || 'modern_ats';

        res.render(templateName, { 
            personal_info: cvData.personal_info,
            summary: cvData.summary,
            experience: cvData.experience,
            education: cvData.education,
            skills: cvData.skills,
            projects: cvData.custom_sections,
            template_settings: cvData.template_settings
        });
    } catch (error) {
        console.error("Preview Error:", error);
        res.status(500).send("خطأ في العرض");
    }
};

exports.downloadCVAsPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const cvData = await UserCVData.findByPk(id, { 
            include: [{ model: Template, as: 'template' }] 
        });

        if (!cvData) return res.status(404).send('الـ CV مش موجود');

        const templateName = cvData.template?.layout_type || 'modern_ats';
        const templatePath = path.join(__dirname, `../templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, {
            personal_info: cvData.personal_info,
            summary: cvData.summary,
            experience: cvData.experience,
            education: cvData.education,
            skills: cvData.skills,
            projects: cvData.custom_sections,
            template_settings: cvData.template_settings
        });

        const browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=CareerNode_CV_${id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).send("خطأ أثناء استخراج الـ PDF");
    }
};

exports.getTemplates = async (req, res) => {
    try {
        // سحب جميع القوالب المفعلة من الداتابيز
        const allTemplates = await Template.findAll({ where: { is_active: true } });
        res.status(200).json({ success: true, data: allTemplates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};