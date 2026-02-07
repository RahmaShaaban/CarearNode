const { UserCVData } = require('../models/index');
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

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