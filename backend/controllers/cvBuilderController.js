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

        // 🆕 تم إزالة التحديث التلقائي من هنا بناءً على طلبك
        res.status(201).json({ success: true, data: newCVData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🆕 الفانكشن الجديدة (حفظ يدوي في البروفايل) تبدأ من سطر 58
exports.saveCVToProfile = async (req, res) => {
    try {
        const { userId, cvId } = req.body;
        await User.update(
            { cv_id: cvId }, 
            { where: { id: userId } }
        );
        res.status(200).json({ success: true, message: "CV saved successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.previewCV = async (req, res) => {
    try {
        const { id } = req.params;
        const cvData = await UserCVData.findByPk(id, { include: [{ model: Template, as: 'template' }] });
        if (!cvData) return res.status(404).send('CV Not Found');
        res.render(cvData.template?.layout_type || 'modern_ats', { 
            personal_info: cvData.personal_info,
            summary: cvData.summary,
            experience: cvData.experience,
            education: cvData.education,
            skills: cvData.skills,
            projects: cvData.custom_sections,
            template_settings: cvData.template_settings
        });
    } catch (error) {
        res.status(500).send("Render Error");
    }
};

exports.downloadCVAsPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const cvData = await UserCVData.findByPk(id, { include: [{ model: Template, as: 'template' }] });
        const templateName = cvData.template?.layout_type || 'modern_ats';
        const html = await ejs.renderFile(path.join(__dirname, `../templates/${templateName}.ejs`), {
            personal_info: cvData.personal_info,
            summary: cvData.summary,
            experience: cvData.experience,
            education: cvData.education,
            skills: cvData.skills,
            projects: cvData.custom_sections,
            template_settings: cvData.template_settings
        });
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        res.contentType("application/pdf");
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).send("PDF Error");
    }
};

exports.getTemplates = async (req, res) => {
    try {
        const allTemplates = await Template.findAll({ where: { is_active: true } });
        res.status(200).json({ success: true, data: allTemplates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};