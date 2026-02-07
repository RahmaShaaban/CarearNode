const fs = require('fs');
const PDFParser = require("pdf2json");
const { CV } = require('../models/index');
const { CohereClient } = require('cohere-ai'); // استيراد كوهير

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

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

        // ✅ استخدام Cohere بدلاً من Gemini لتجنب الـ 404
// التعديل في سطر الـ cohere.chat
const response = await cohere.chat({
    model: "command-r-08-2024", // الموديل الحالي المتاح في 2026
    message: `Analyze this CV text as an HR expert. Return ONLY a valid JSON object with keys: "overall_score" (number), "strengths" (array), "missing_skills" (array), "recommendations" (array).
    CV Text: ${extractedText}`,
});


        // تنظيف النتيجة لاستخراج الـ JSON
        const textResponse = response.text;
        const cleanJson = textResponse.replace(/```json|```/g, "").trim();
        const analysisData = JSON.parse(cleanJson);

        const newCV = await CV.create({
            file_path: filePath,
            raw_text: extractedText,
            analysis_result: analysisData,
            user_id: userId
        });

        res.status(200).json({ success: true, message: "تم التحليل بنجاح!", data: newCV });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};