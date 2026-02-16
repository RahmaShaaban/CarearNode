const fs = require('fs');
const PDFParser = require("pdf2json");
const { CV , User} = require('../models/index');
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
                        content: `You are an Elite Technical Recruiter. Your task is to perform a FULL AUDIT of the CV text.
                        
                        AUDIT SCOPE (Check EVERYTHING):
                        1. Personal Info: Professionalism of email, LinkedIn presence (if mentioned), and location clarity.
                        2. Summary: Is it generic or tailored?
                        3. Technical Skills: Depth and variety.
                        4. Projects: Complexity, tools used, and impact. (Crucial: Differentiate between basic student projects and advanced ones).
                        5. Format: Organization and readability.

                        SCORING RULES:
                        - If the file is NOT a CV (e.g. book, exam, notes), set is_cv to false and overall_score to 0.0.
                        - If it is a CV, score it from 1.0 to 10.0. 
                        - Be STRICT: If there are missing skills or basic projects, the score MUST reflect that (no automatic 10s).
                        
                        Return ONLY JSON: { "overall_score": float, "is_cv": boolean, "strengths": [], "missing_skills": [], "recommendations": [] }`
                    },
                    {
                        role: "user",
                        content: `Perform a deep audit on this text. Evaluate project complexity and professional details: ${extractedText}`
                    }
                ],
                response_format: { type: "json_object" }
            },
            { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let parsedData = JSON.parse(response.data.choices[0].message.content);

        // 🆕 --- منطق المعالجة الحسابية (لضمان الفروقات والمصداقية) ---
        
        // 1. تصفير أي ملف مش سي في فوراً
        if (parsedData.is_cv === false || parsedData.overall_score < 2.0) {
            parsedData.overall_score = 0.0;
            parsedData.is_cv = false;
            parsedData.recommendations = ["The uploaded file is not recognized as a professional CV. Please upload a PDF resume."];
        } 
        // 2. تطبيق خصم حقيقي على النواقص عشان يحس بالفرق بين السنتين
        else if (parsedData.missing_skills && parsedData.missing_skills.length > 0) {
            const gaps = parsedData.missing_skills.length;
            let currentScore = parseFloat(parsedData.overall_score);
            
            // خصم تصاعدي: كل ما زادت النواقص زاد الخصم
            let penalty = gaps * 0.6; 
            let finalScore = currentScore - penalty;

            // سقف للدرجة: لو فيه نواقص مستحيل ياخد 10 أو حتى 9
            if (finalScore > 8.8) finalScore = 8.5;
            if (gaps > 3 && finalScore > 7.5) finalScore = 7.2;

            parsedData.overall_score = parseFloat(Math.max(1.0, finalScore).toFixed(1));
        }

        const newCV = await CV.create({
            file_path: filePath,
            raw_text: extractedText,
            analysis_result: parsedData,
            user_id: userId
        });

        await User.update({ cv_id_analysis: newCV.id }, { where: { id: userId } });

        res.status(200).json({ success: true, message: "CV Deep Audit Complete", data: newCV });

    } catch (error) {
        res.status(500).json({ success: false, error: "فشل التحليل" });
    }
};