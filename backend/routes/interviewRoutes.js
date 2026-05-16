// // backend/routes/interviewRoutes.js
// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const multer = require('multer');
// const FormData = require('form-data');
// const interviewController = require('../controllers/interviewController');
// const Question = require('../models/InterviewQuestion'); // استدعاء موديل الأسئلة هنا أفضل

// const upload = multer({ storage: multer.memoryStorage() });

// // 1️⃣ راوت بدء الأنترفيو
// router.post('/start', interviewController.startInterview);

// // 2️⃣ راوت تحليل الفيديو وحفظ النتيجة
// router.post('/analyze', upload.single('video'), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: "لم يتم استقبال أي فيديو" });

//         // أخذ الـ interviewId والبيانات من الـ body
//         const { interviewId, questionText } = req.body;

//         const formData = new FormData();
//         formData.append('file', req.file.buffer, {
//             filename: req.file.originalname,
//             contentType: req.file.mimetype,
//         });

//         console.log("Sending video to AI Server for analysis...");

//         const aiResponse = await axios.post('http://127.0.0.1:5000/analyze', formData, {
//             headers: { ...formData.getHeaders() },
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity
//         });

//         const analysisResults = aiResponse.data;

//         // حفظ النتيجة في الداتابيز
//         // تأكدي أن أسماء الحقول تطابق الـ Model اللي عملناه
//         await Question.create({
//             interview_id: interviewId,
//             question_text: questionText,
//             analysis_data: analysisResults,
//             score: analysisResults.score || analysisResults.overall_score || 0,
//             video_url: null 
//         });

//         res.json(analysisResults);

//     } catch (error) {
//         console.error("Analysis/DB Error:", error.response?.data || error.message);
//         res.status(500).json({ error: "فشل في التحليل أو الحفظ في قاعدة البيانات" });
//     }
// });

// // 3️⃣ راوت إنهاء الأنترفيو
// router.post('/finish', interviewController.finishInterview);

// // 4️⃣ راوت توليد الأسئلة
// router.post('/generate-questions', async (req, res) => {
//     try {
//         const response = await axios.post('http://127.0.0.1:5000/generate-question', req.body); 
//         res.json(response.data);
//     } catch (error) {
//         console.error("AI Server Error:", error.message);
//         res.status(500).json({ error: "Could not generate questions" });
//     }
// });

// module.exports = router;
//////////////////////////////////////////////////////////////////////////////////////
// backend/routes/interviewRoutes.js
// backend/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const Question = require('../models/InterviewQuestion'); 
const { sendInterviewReport } = require('../emailService'); 

// 1️⃣ راوت بدء الأنترفيو (للحصول على interviewId)
router.post('/start', interviewController.startInterview);

// 2️⃣ راوت حفظ النتائج (يتم استدعاؤه بعد التحليل في بايثون)
router.post('/save-result', async (req, res) => {
    try {
        const { interviewId, questionText, analysisResults } = req.body;

        if (!interviewId) {
            return res.status(400).json({ error: "interviewId is required" });
        }

        // حفظ النتيجة القادمة من بايثون في الداتابيز
        const savedQuestion = await Question.create({
            interview_id: interviewId,
            question_text: questionText,
            analysis_data: analysisResults,
            // سحب السكور من هيكل رد FastAPI (content.score)
            score: analysisResults.content?.score || 0,
            video_url: null 
        });

        console.log(`✅ Result saved for interview: ${interviewId}`);
        res.json({ success: true, data: savedQuestion });

    } catch (error) {
        console.error("❌ Database Save Error:", error.message);
        res.status(500).json({ error: "فشل في حفظ النتائج في قاعدة البيانات" });
    }
});
// 4️⃣ راوت جلب التقييم النهائي (اللي الـ Frontend بيدور عليه)
// 4️⃣ راوت جلب التقييم النهائي (التعديل لـ Sequelize)
router.get('/feedback/:interviewId', async (req, res) => {
    try {
        const { interviewId } = req.params;

        // في Sequelize بنستخدم findAll وبنحدد الشرط جوه where
        const feedback = await Question.findAll({ 
            where: { 
                interview_id: interviewId 
            } 
        });

        if (!feedback || feedback.length === 0) {
            return res.status(404).json({ error: "لم يتم العثور على نتائج لهذا الإنترفيو" });
        }

        res.json({ success: true, data: feedback });
    } catch (error) {
        console.error("❌ Error fetching feedback:", error.message);
        res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
});

// 5️⃣ Send Shipped Interview Report Email (Dynamic Analytics from Frontend)
// 5️⃣ Send Shipped Interview Report Email (Fetching Overall Data Directly from Database)
// 5️⃣ Send Shipped Interview Report Email (No Fake Numbers - Direct UI Mapping)
// router.post('/send-report', async (req, res) => {
//     // استقبلنا الأسماء الصريحة الحقيقية المبعوتة من الفرونتد مباشرة
//     const { email, interviewId, overall, knowledge, verbal, nonVerbal, overview } = req.body;

//     if (!email || !interviewId) {
//         return res.status(400).json({ error: "Email and Interview ID are required." });
//     }

//     try {
//         // 1. جلب تقييمات الأسئلة (دي شغالة معاكي تمام ومفيهاش مشكلة)
//         const questionsData = await Question.findAll({ 
//             where: { interview_id: interviewId } 
//         });

//         if (!questionsData || questionsData.length === 0) {
//             return res.status(404).json({ error: "No evaluation records found for this interview." });
//         }

//         // 2. بناء تفاصيل الأسئلة (بدون الـ Tips)
//         let questionsHtml = '';
//         questionsData.forEach((q, index) => {
//             const analysis = q.analysis_data || {};
//             const content = analysis.content || {};
//             const speech = analysis.speech || {};
//             const vision = analysis.vision || {};

//             const score = q.score ?? content.score ?? 0;
//             const feedback = content.feedback || 'No feedback provided.';
//             const tone = speech.tone || 'N/A';
//             const wpm = speech.wpm || 0;
//             const wpmFeedback = speech.wpm_feedback || 'N/A';
//             const speechPattern = speech.speech_pattern || 'N/A';
            
//             const eyeContactGrade = vision.eye_contact?.grade || 'N/A';
//             const eyeContactScore = vision.eye_contact?.score ?? 'N/A';
//             const headFocusAdvice = vision.head_focus?.advice || 'N/A';
//             const postureEngagement = vision.body?.engagement_score ?? 'N/A';

//             questionsHtml += `
//                 <div style="background-color: #fbfbfb; border: 1px solid #eef2f1; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
//                     <h4 style="color: #2F5D54; margin-top: 0; font-size: 16px; border-bottom: 1px dashed #ddd; padding-bottom: 5px;">
//                         Question ${index + 1}: ${q.question_text || 'Technical Question'}
//                     </h4>
//                     <p style="margin: 8px 0;">
//                         <strong>Content Score:</strong> 
//                         <span style="color: #2F5D54; font-weight: bold; font-size: 15px;">${score}/100</span>
//                     </p>
//                     <p style="margin: 8px 0; color: #444; line-height: 1.5;">
//                         <strong>Analysis & Feedback:</strong> ${feedback}
//                     </p>
                    
//                     <div style="margin: 12px 0; padding: 10px; background-color: #f7faf9; border-left: 3px solid #58A492; border-radius: 4px; font-size: 13.5px; color: #555;">
//                         <strong style="color: #2F5D54; display: block; margin-bottom: 4px;">🎙️ Speech & Verbal Analytics:</strong>
//                         • <strong>Voice Tone:</strong> ${tone}<br/>
//                         • <strong>Speech Pace:</strong> ${wpm} WPM (${wpmFeedback})<br/>
//                         • <strong>Speech Pattern:</strong> ${speechPattern}
//                     </div>

//                     <div style="margin: 12px 0; padding: 10px; background-color: #f7faf9; border-left: 3px solid #2F5D54; border-radius: 4px; font-size: 13.5px; color: #555;">
//                         <strong style="color: #2F5D54; display: block; margin-bottom: 4px;">👁️ Vision & Non-Verbal Analytics:</strong>
//                         • <strong>Eye Contact:</strong> ${eyeContactGrade} (Score: ${eyeContactScore}/100)<br/>
//                         • <strong>Head Focus:</strong> ${headFocusAdvice}<br/>
//                         • <strong>Engagement Score:</strong> ${postureEngagement}%
//                     </div>
//                 </div>
//             `;
//         });

//         // 3. قالب الإيميل الشامل بالاعتماد الصارم على الأرقام القادمة من الواجهة
//         const reportContent = `
//             <div style="direction: ltr; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                
//                 <div style="background-color: #2F5D54; color: white; padding: 25px; text-align: center;">
//                     <h2 style="margin: 0; font-size: 26px; letter-spacing: 0.5px;">Career AI Guide</h2>
//                     <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Comprehensive Interview Performance Report</p>
//                 </div>
                
//                 <div style="padding: 25px; background-color: #ffffff;">
//                     <p style="font-size: 16px; color: #222; margin-top: 0;">Hi Candidate,</p>
//                     <p style="font-size: 14.5px; color: #555; line-height: 1.6;">
//                         Thank you for completing your automated interview session. Below is your synchronized performance dashboard profile:
//                     </p>
                    
//                     <h3 style="color: #2F5D54; border-bottom: 2px solid #2F5D54; padding-bottom: 5px; margin-top: 25px; font-size: 18px;">
//                         📊 Overall Performance Dashboard
//                     </h3>
                    
//                     <div style="background-color: #f0f7f5; border-left: 5px solid #2F5D54; padding: 15px; margin: 15px 0; border-radius: 4px;">
//                         <span style="font-size: 15px; font-weight: bold; color: #2F5D54; display: block;">
//                             Performance Summary: <span style="color: #444; font-weight: normal;">${overview || 'Completed'}</span>
//                         </span>
//                     </div>
                    
//                     <table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center; font-size: 14px;">
//                         <thead>
//                             <tr style="background-color: #f2f2f2; color: #333; font-weight: bold;">
//                                 <th style="padding: 10px; border: 1px solid #ddd;">Overall Index</th>
//                                 <th style="padding: 10px; border: 1px solid #ddd;">Technical Knowledge</th>
//                                 <th style="padding: 10px; border: 1px solid #ddd;">Verbal Skills</th>
//                                 <th style="padding: 10px; border: 1px solid #ddd;">Non-Verbal Cues</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #2F5D54; font-size: 15px;">${overall}%</td>
//                                 <td style="padding: 12px; border: 1px solid #ddd;">${knowledge}%</td>
//                                 <td style="padding: 12px; border: 1px solid #ddd;">${verbal}%</td>
//                                 <td style="padding: 12px; border: 1px solid #ddd;">${nonVerbal}%</td>
//                             </tr>
//                         </tbody>
//                     </table>

//                     <br/>

//                     <h3 style="color: #2F5D54; border-bottom: 2px solid #2F5D54; padding-bottom: 5px; font-size: 18px; margin-top: 10px;">
//                         📝 Question-by-Question Evaluation
//                     </h3>
                    
//                     ${questionsHtml}

//                     <p style="margin-top: 35px; font-size: 13px; color: #999; text-align: center; line-height: 1.5; border-top: 1px solid #eee; padding-top: 15px;">
//                         This report was securely processed and generated by the Career AI Guide engine. All data matches your dashboard profile. Best of luck!
//                     </p>
//                 </div>
                
//                 <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
//                     © 2026 Career AI Guide. All rights reserved.
//                 </div>
//             </div>
//         `;

//         await sendInterviewReport(email, reportContent);
//         res.json({ success: true, message: "Comprehensive data report generated and sent successfully!" });

//     } catch (error) {
//         console.error("❌ Synced Email Route Error:", error.message);
//         res.status(500).json({ error: "An error occurred while generating the report." });
//     }
// });
// 3️⃣ راوت إنهاء الأنترفيو
router.post('/send-report', async (req, res) => {
    const { email, interviewId } = req.body;
    if (!email || !interviewId) {
        return res.status(400).json({ error: "Email and Interview ID are required." });
    }

    try {
        // 1️⃣ جلب الأسئلة الخاصة بالإنترفيو من جدول interview_questions
        const questionsData = await Question.findAll({ where: { interview_id: interviewId } });
        
        let questionsHtml = '';
        if (questionsData && questionsData.length > 0) {
            questionsData.forEach((q, index) => {
                // سحب حقل analysis_data والتعامل معه سواء كان Object أو String
                let analysis = q.analysis_data || {};
                if (typeof analysis === 'string') {
                    try { analysis = JSON.parse(analysis); } catch(e) { console.error("Parsing analysis_data failed", e); }
                }

                // تفكيك البيانات من الـ JSON الشامل بتاعك بأمان
                const speech = analysis.speech || {};
                const vision = analysis.vision || {};
                const body = vision.body || {};
                const eyeContact = vision.eye_contact || {};
                const headFocus = vision.head_focus || {};
                const attire = vision.attire || {};
                const emotions = vision.emotions || {};
                const content = analysis.content || {};
                const tips = content.tips || [];

                // تحويل مصفوفة الـ Tips إلى عناصر HTML List
                let tipsHtml = '';
                tips.forEach(tip => { tipsHtml += `<li style="margin-bottom: 6px;">${tip}</li>`; });

                // بناء كارت السؤال الشامل لكل تفاصيل الـ JSON
                questionsHtml += `
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; direction: ltr; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <h4 style="color: #2F5D54; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                            Question ${index + 1}: ${q.question_text || 'Technical Question'}
                        </h4>
                        
                        <div style="margin-top: 15px;">
                            <h5 style="color: #58a492; margin: 10px 0 5px 0; font-size: 14px;">📝 Answer Content Evaluation</h5>
                            <p style="margin: 4px 0;"><strong>Score:</strong> <span style="color: #2F5D54; font-weight: bold;">${q.score ?? content.score ?? 0}/100</span></p>
                            <p style="margin: 6px 0; line-height: 1.5; color: #475569;"><strong>AI Feedback:</strong> ${content.feedback || 'No feedback provided.'}</p>
                            ${tipsHtml ? `<div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 10px;"><strong style="color: #475569; font-size: 13px;">💡 Improvement Tips:</strong><ul style="margin: 5px 0 0 20px; padding: 0; color: #64748b; font-size: 13px;">${tipsHtml}</ul></div>` : ''}
                        </div>

                        <div style="margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                            <h5 style="color: #58a492; margin: 0 0 10px 0; font-size: 14px;">🗣️ Verbal & Speech Analysis</h5>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                                <tr>
                                    <td style="padding: 6px 0; width: 50%;"><strong>Words Per Minute (WPM):</strong> ${speech.wpm || 0} (${speech.wpm_feedback || 'N/A'})</td>
                                    <td style="padding: 6px 0;"><strong>Voice Tone:</strong> ${speech.tone || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Pause Ratio:</strong> ${speech.pause_ratio || 0}%</td>
                                    <td style="padding: 6px 0;"><strong>Speech Pattern:</strong> ${speech.speech_pattern || 'N/A'}</td>
                                </tr>
                            </table>
                            <div style="background-color: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 8px; font-size: 13px; font-style: italic; color: #64748b;">
                                " ${speech.transcript || 'No transcript available.'} "
                            </div>
                        </div>

                        <div style="margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                            <h5 style="color: #58a492; margin: 0 0 10px 0; font-size: 14px;">👁️ Non-Verbal & Visual Analysis</h5>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                                <tr>
                                    <td style="padding: 6px 0; width: 50%;"><strong>Eye Contact Score:</strong> ${eyeContact.score || 0}/100 (${eyeContact.grade || 'N/A'})</td>
                                    <td style="padding: 6px 0;"><strong>Head Focus Score:</strong> ${headFocus.score || 0}/100</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Body Openness:</strong> ${body.body_openness || 'N/A'}</td>
                                    <td style="padding: 6px 0;"><strong>Posture Straight Score:</strong> ${body.straight_score || 0}%</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Hand Open Score:</strong> ${vision.hand?.open_score || 0}%</td>
                                    <td style="padding: 6px 0;"><strong>Attire Status:</strong> ${attire.status || 'Casual'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Dominant Emotion:</strong> Negative (${emotions.negative || 0}%)</td>
                                    <td style="padding: 6px 0;"><strong>Engagement Score:</strong> ${body.engagement_score || 0}%</td>
                                </tr>
                            </table>
                            <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;"><strong>Visual Advice:</strong> ${eyeContact.advice || headFocus.advice || 'Good visual focus.'}</p>
                        </div>
                    </div>`;
            });
        } else {
            questionsHtml = '<p style="color: #64748b; text-align: center;">No detailed questions found.</p>';
        }

        // 2️⃣ جلب البيانات الشاملة من جدول الـ interviews (الـ summary_data)
        let finalOverall = "0.0";
        let finalKnowledge = "0.0";
        let finalVerbal = "0.0";
        let finalNonVerbal = "0.0";
        let finalOverview = "Interview Completed.";

        const InterviewModel = require('../models/Interview'); 
        const generalInterview = await InterviewModel.findOne({ where: { id: interviewId } });
        
        if (generalInterview) {
            let summary = generalInterview.summary_data || generalInterview.summaryData;
            
            if (typeof summary === 'string') {
                try { summary = JSON.parse(summary); } catch(e) {}
            }
            
            if (summary && summary.averages) {
                finalOverall = summary.averages.overall || "0.0";
                finalKnowledge = summary.averages.knowledge || "0.0";
                finalVerbal = summary.averages.verbal || "0.0";
                finalNonVerbal = summary.averages.nonVerbal || "0.0";
            }
            if (summary && summary.overviewText) {
                finalOverview = summary.overviewText;
            }
        }

        // 3️⃣ قالب الإيميل الشامل والفاخر النهائي
        const reportContent = `
            <div style="direction: ltr; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; background-color: #f8fafc; color: #334155;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #2F5D54; margin-bottom: 5px; font-size: 26px;">Career AI Guide Report</h2>
                    <p style="color: #64748b; margin-top: 0; font-size: 14px;">Comprehensive Interview Performance & Analytics</p>
                </div>
                
                <div style="background-color: #ffffff; border-left: 4px solid #58a492; padding: 20px; margin: 20px 0; border-radius: 8px; font-size: 15px; line-height: 1.6; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                    <strong style="color: #2F5D54; font-size: 16px;">🎯 Executive Performance Summary:</strong><br/>
                    <span style="color: #475569; display: inline-block; margin-top: 5px;">${finalOverview}</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; text-align: center; font-size: 14px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                    <thead>
                        <tr style="background-color: #2F5D54; color: #ffffff;">
                            <th style="padding: 15px;">Overall Index</th>
                            <th style="padding: 15px;">Technical Knowledge</th>
                            <th style="padding: 15px;">Verbal Skills</th>
                            <th style="padding: 15px;">Non-Verbal Cues</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-weight: bold; color: #1e293b;">
                            <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; color: #58a492; font-size: 20px;">${parseFloat(finalOverall).toFixed(1)}%</td>
                            <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${parseFloat(finalKnowledge).toFixed(1)}%</td>
                            <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${parseFloat(finalVerbal).toFixed(1)}%</td>
                            <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${parseFloat(finalNonVerbal).toFixed(1)}%</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3 style="color: #2F5D54; margin-top: 40px; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">📊 Detailed Question-by-Question Metrics</h3>
                <div>
                    ${questionsHtml}
                </div>
                
                <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    This comprehensive analytics report was securely generated by the Career AI Guide Engine.
                </div>
            </div>`;

        // 4️⃣ إرسال الإيميل
        await sendInterviewReport(email, reportContent);
        return res.json({ success: true, message: "Sent successfully!" });

    } catch (error) {
        console.error("❌ Error compiling comprehensive report:", error);
        return res.status(500).json({ error: "Internal server error occurred." });
    }
});

router.post('/finish', interviewController.finishInterview);

module.exports = router;