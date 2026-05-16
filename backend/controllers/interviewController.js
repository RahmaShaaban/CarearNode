// backend/controllers/interviewController.js
const { Interview, InterviewQuestion, User } = require('../models');
const { sendInterviewReport } = require('../emailService'); // استيراد خدمة الإيميل

// 1. بدء المقابلة (إنشاء سجل جديد)
exports.startInterview = async (req, res) => {
    try {
        const { track, level, language, userId } = req.body;

        const newInterview = await Interview.create({
            target_role: track,
            experience_level: level,
            language: language === 'ar' ? 'Arabic' : 'English',
            user_id: userId || null 
        });

        res.status(201).json({
            success: true,
            interviewId: newInterview.id
        });
    } catch (error) {
        console.error("Error in startInterview:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 2. حفظ نتيجة كل سؤال
exports.addQuestionResult = async (req, res) => {
    try {
        const { interviewId, questionText, analysisResults } = req.body;

        const questionEntry = await Question.create({
            interview_id: interviewId,
            question_text: questionText,
            analysis_data: analysisResults, 
            score: analysisResults.content?.score || 0, 
            video_url: null 
        });

        res.status(201).json({
            success: true,
            data: questionEntry
        });
    } catch (error) {
        console.error("Error in addQuestionResult:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. إنهاء المقابلة وحساب التقييم النهائي وإرسال الإيميل
exports.finishInterview = async (req, res) => {
    try {
        const { interviewId, overallScore, summaryData, overallFeedback } = req.body;

        // تحديث بيانات المقابلة في الداتابيز
        await Interview.update(
            { 
                overall_score: overallScore, 
                overall_feedback: overallFeedback || (summaryData ? summaryData.overviewText : null),
                summary_data: summaryData 
            },
            { where: { id: interviewId } }
        );

       
        res.status(200).json({
            success: true,
            message: "Interview summary saved ."
        });
    } catch (error) {
        console.error("❌ Error in finishInterview:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};