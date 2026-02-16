const fs = require('fs');
const PDFParser = require("pdf2json");
const { CV , User} = require('../models/index');
const axios = require('axios');

/**
 * دالة لتحويل ملف الـ PDF إلى نص خام
 */
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
        // 1. التأكد من رفع الملف
        if (!req.file) {
            return res.status(400).json({ success: false, message: "لم يتم رفع ملف" });
        }

        const filePath = req.file.path;
        const userId = req.body.userId;

        // 2. استخراج النص من الـ PDF
        const extractedText = await parsePDF(filePath);

        // 3. إرسال النص لـ Groq API للتحليل
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Technical Recruiter at a top-tier software company. 
                        Your goal is to evaluate CVs objectively on a scale of 0.0 to 10.0.
                        
                        SCORING RUBRIC:
                        - Technical Skills (Languages, Databases, Frameworks): Up to 4.0 points.
                        - Projects & Practical Experience (Complexity and Tools used): Up to 4.0 points.
                        - Education & Certifications: Up to 2.0 points.
                        
                        CRITICAL INSTRUCTIONS:
                        - If the text is NOT a CV (e.g. lecture notes, book chapter, or exam), the overall_score MUST be between 0.0 and 1.0.
                        - For a student/junior CV with solid projects (like Node.js, AI, C#), be fair and encouraging; scores should typically range from 7.0 to 9.0.
                        - Return ONLY a valid JSON object.`
                    },
                    {
                        role: "user",
                        content: `Analyze the following text and return a JSON object with: 
                        "overall_score" (float), "is_cv" (boolean), "strengths" (array), "missing_skills" (array), "recommendations" (array).
                        
                        Text: ${extractedText}`
                    }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 4. معالجة النتيجة القادمة من Groq
        const analysisData = response.data.choices[0].message.content;
        const parsedData = JSON.parse(analysisData);

        // 5. حفظ البيانات في قاعدة البيانات (PostgreSQL/Supabase)
        const newCV = await CV.create({
            file_path: filePath,
            raw_text: extractedText,
            analysis_result: parsedData,
            user_id: userId
        });


        /////////////////////////////////////////////////////////////////

        // 🆕 التعديل هنا (سطر 85 تقريباً): تحديث الـ FK الخاص بالتحليل في جدول اليوزر
        await User.update(
            { cv_id_analysis: newCV.id }, 
            { where: { id: userId } }
        );

        /////////////////////////////////////////////////////////////////

        
        // 6. إرسال الرد للـ Frontend
        res.status(200).json({ 
            success: true, 
            message: "تم التحليل الاحترافي بواسطة Groq بنجاح!", 
            data: newCV 
        });

    } catch (error) {
        console.error("❌ Groq Analysis Error:", error.response?.data || error.message);
        
        res.status(500).json({ 
            success: false, 
            error: "فشل التحليل عبر AI",
            details: error.response?.data?.error?.message || error.message 
        });
    }
};