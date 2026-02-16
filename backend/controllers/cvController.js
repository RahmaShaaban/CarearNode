const fs = require('fs');
const PDFParser = require("pdf2json");
const { CV, User } = require('../models/index');
const axios = require('axios');

function parsePDF(filePath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
        pdfParser.loadPDF(filePath);
    });
}

exports.processCV = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "لم يتم رفع ملف" });

        const filePath = req.file.path;
        const userId = req.body.userId;
        const extractedText = await parsePDF(filePath);

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a Strict Recruiter. Analyze CV gaps.
                        Return ONLY JSON: { "overall_score": float, "is_cv": boolean, "strengths": [], "missing_skills": [], "recommendations": [] }`
                    },
                    {
                        role: "user",
                        content: `CV Text: ${extractedText}`
                    }
                ],
                response_format: { type: "json_object" }
            },
            { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let parsedData = JSON.parse(response.data.choices[0].message.content);

        // 🆕 --- منطق تعديل السكور الحسابي (عشان الرقم يتغير غصب عن الـ AI) ---
        if (parsedData.missing_skills && parsedData.missing_skills.length > 0) {
            const gapsCount = parsedData.missing_skills.length;
            
            // 1. نبدأ بسكور افتراضي عالي لو الـ AI باعت 10
            let rawScore = parseFloat(parsedData.overall_score);
            
            // 2. خصم إجباري: 0.7 درجة عن كل مهارة ناقصة (Cloud, DevOps, etc.)
            let deduction = gapsCount * 0.7; 
            
            // 3. حساب السكور الجديد
            let newScore = Math.max(1.5, rawScore - deduction);

            // 4. تأمين: لو فيه مهارات ناقصة مستحيل الدرجة تزيد عن 8.0
            if (gapsCount >= 2 && newScore > 8.0) newScore = 7.8;
            if (gapsCount >= 4 && newScore > 7.0) newScore = 6.5;

            // تحديث الرقم النهائي
            parsedData.overall_score = parseFloat(newScore.toFixed(1));
        }
        // ----------------------------------------------------------------------

        const newCV = await CV.create({
            file_path: filePath,
            raw_text: extractedText,
            analysis_result: parsedData,
            user_id: userId
        });

        await User.update({ cv_id_analysis: newCV.id }, { where: { id: userId } });

        res.status(200).json({ success: true, message: "CV Analyzed", data: newCV });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: "فشل التحليل" });
    }
};