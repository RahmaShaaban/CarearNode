// backend/controllers/interviewController.js
const { Interview, InterviewQuestion, User } = require('../models');
const { sendInterviewReport } = require('../emailService'); // استيراد خدمة الإيميل
const axios = require('axios');
const FormData = require('form-data');
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

exports.analyzeInBackground = async (req, res) => {
    try {
        const { interviewId, language, email } = req.body;
        const files = req.files; 
        let questions = req.body.questions; 

        // التأكد من استلام ملفات
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No video files received." });
        }

        if (!Array.isArray(questions)) {
            questions = [questions];
        }

        // 1️⃣ الرد الفوري للفرونت إند عشان اليوزر يتصفح براحته
        res.status(200).json({ success: true, message: "Analysis started in background. You will receive an email." });

        // ==========================================
        // 🚀 2️⃣ تشغيل التحليل في الخلفية وبناء التقرير
        // ==========================================
        const processInterview = async () => {
            let totalKnowledge = 0, totalVerbal = 0, totalNonVerbal = 0, totalOverall = 0;
            let questionsHtml = '';
            let validQuestionsCount = 0;

            for (let i = 0; i < files.length; i++) {
                const aiFormData = new FormData();
                aiFormData.append('file', files[i].buffer, { filename: files[i].originalname }); 
                aiFormData.append('question', questions[i]);
                aiFormData.append('language', language);

                try {
                    console.log(`[Background] Analyzing Question ${i + 1}...`);
                    const aiResponse = await axios.post('http://localhost:5000/analyze/all', aiFormData, {
                        headers: aiFormData.getHeaders() 
                    });
                    
                    const analysisData = aiResponse.data;
                    
                    // 💾 الحفظ مباشرة في قاعدة البيانات (أسرع وأضمن من axios اللي بيكلم نفسه)
                    await InterviewQuestion.create({
                        interview_id: interviewId,
                        question_text: questions[i],
                        analysis_data: analysisData,
                        score: analysisData.content?.score || 0,
                        video_url: null 
                    });

                    // 🧮 تفكيك البيانات لبناء التقرير

// 🧮 تفكيك البيانات لبناء التقرير
                    const speech = analysisData.speech || {};
                    const vision = analysisData.vision || {};
                    const body = vision.body || {};
                    const eyeContact = vision.eye_contact || {};
                    const headFocus = vision.head_focus || {};
                    const attire = vision.attire || {};
                    const emotions = vision.emotions || {};
                    const content = analysisData.content || {};
                    const tips = content.tips || [];

                    // 🚨 1️⃣ فحص النص للتحذير (لو مفيش صوت أو الإجابة أقل من 3 كلمات)
                    const transcriptText = speech.transcript || '';
                    const wordCount = transcriptText.trim().split(/\s+/).filter(word => word.length > 0).length;
                    const showWarning = wordCount < 3;

                    const warningHtml = showWarning ? `
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 15px; margin-top: 15px; margin-bottom: 15px; border-radius: 6px;">
                            <strong style="color: #b91c1c; font-size: 14px;">⚠️ Warning: Insufficient Content</strong>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #991b1b;">The system could not hear you clearly or the answer was too short.</p>
                        </div>
                    ` : '';

                    // جلب بيانات لمس الوجه وضم اليدين (حسب القيم الراجعة من البايثون)
                    const crossedArmsStatus = body.crossed_arm_score ? "Detected (Yes)" : "Not Detected (No)";
                    const faceTouchesCount = body.touch_face_score || 0;

                    // حساب الدرجات
                    const knowledgeScore = parseFloat(content.score || 0);
                    let wpmScore = 100;
                    if (speech.wpm < 110) wpmScore = Math.max(0, 100 - (110 - speech.wpm));
                    else if (speech.wpm > 160) wpmScore = Math.max(0, 100 - (speech.wpm - 160));
                    let pauseScore = 100;
                    if (speech.pause_ratio > 45) pauseScore = Math.max(0, 100 - (speech.pause_ratio - 45) * 1.5);
                    else if (speech.pause_ratio < 15) pauseScore = 80;
                    let toneScore = 80; 
                    if (speech.tone?.includes("Dynamic")) toneScore = 100;
                    if (speech.tone?.includes("Monotone")) toneScore = 50;
                    const verbalScore = (wpmScore * 0.4) + (pauseScore * 0.4) + (toneScore * 0.2);

                    const straightRaw = body.straight_score || 0; 
                    const straight = straightRaw > 10 ? 100 : (straightRaw / 10) * 100;
                    const nonVerbalScore = ((vision.hand?.open_score || 0) * 0.10) + (straight * 0.10) + ((body.explaining_score || 0) * 0.10) + ((eyeContact.score || 0) * 0.30) + ((headFocus.score || 0) * 0.20) + ((attire.score || 0) * 0.10) + ((emotions.positive || 0) * 0.10);

                    const overallScore = (knowledgeScore * 0.4) + (verbalScore * 0.3) + (nonVerbalScore * 0.3);

                    totalKnowledge += knowledgeScore;
                    totalVerbal += verbalScore;
                    totalNonVerbal += nonVerbalScore;
                    totalOverall += overallScore;
                    validQuestionsCount++;

                    // بناء HTML السؤال
                   let tipsHtml = '';
                    tips.forEach(tip => { tipsHtml += `<li style="margin-bottom: 6px;">${tip}</li>`; });
                    // 🧠 حساب الإحساس السائد (الأعلى سكور)
                    let dominantEmotionName = "Neutral";
                    let dominantEmotionScore = 0;

                    if (emotions && Object.keys(emotions).length > 0) {
                        // بنجيب اسم الإحساس اللي جاب أعلى رقم في الـ Object
                        let maxKey = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
                        
                        // بنخلي أول حرف Capital عشان يبقى شكله شيك في التقرير
                        dominantEmotionName = maxKey.charAt(0).toUpperCase() + maxKey.slice(1);
                        dominantEmotionScore = Math.round(emotions[maxKey]); // تقريب الرقم
                    }
                    questionsHtml += `
                    <div style="page-break-inside: avoid; break-inside: avoid; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; direction: ltr; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <h4 style="color: #2F5D54; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                            Question ${i + 1}: ${questions[i] || 'Technical Question'}
                        </h4>
                        
                        ${warningHtml} <div style="margin-top: 15px;">
                            <h5 style="color: #58a492; margin: 10px 0 5px 0; font-size: 14px;">📝 Answer Content Evaluation</h5>
                            <p style="margin: 4px 0;"><strong>Score:</strong> <span style="color: #2F5D54; font-weight: bold;">${content.score || 0}/100</span></p>
                            <p style="margin: 6px 0; line-height: 1.5; color: #475569;"><strong>AI Feedback:</strong> ${content.feedback || 'No feedback provided.'}</p>
                            ${tipsHtml ? `<div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 10px;"><strong style="color: #475569; font-size: 13px;">💡 Improvement Tips:</strong><ul style="margin: 5px 0 0 20px; padding: 0; color: #64748b; font-size: 13px;">${tipsHtml}</ul></div>` : ''}
                        </div>

                        <div style="margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                            <h5 style="color: #58a492; margin: 0 0 10px 0; font-size: 14px;">🗣️ Verbal & Speech Analysis</h5>
                            <table style="page-break-inside: avoid; break-inside: avoid; width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                                <tr>
                                    <td style="padding: 6px 0; width: 50%;"><strong>Words Per Minute (WPM):</strong> ${speech.wpm || 0} (${speech.wpm_feedback || 'N/A'})</td>
                                    <td style="padding: 6px 0;"><strong>Voice Tone:</strong> ${speech.tone || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Pause Ratio:</strong> ${speech.pause_ratio || 0}%</td>
                                    <td style="padding: 6px 0;"><strong>Speech Pattern:</strong> ${speech.speech_pattern || 'N/A'}</td>
                                </tr>
                            </table>
                    
                        </div>

                        <div style="margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                            <h5 style="color: #58a492; margin: 0 0 10px 0; font-size: 14px;">👁️ Non-Verbal & Visual Analysis</h5>
                            <table style="page-break-inside: avoid; break-inside: avoid; width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
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
                                    <td style="padding: 6px 0;"><strong>Crossed Arms:</strong> ${crossedArmsStatus}</td>
                                    <td style="padding: 6px 0;"><strong>Face Touches:</strong> ${faceTouchesCount}%</td>
                                </tr>
                             <tr>
    <td style="padding: 6px 0;"><strong>Dominant Emotion:</strong> ${dominantEmotionName} (${dominantEmotionScore}%)</td>
    <td style="padding: 6px 0;"><strong>Engagement Score:</strong> ${body.engagement_score || 0}%</td>
</tr>
                            </table>
                            <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;"><strong>Visual Advice:</strong> ${eyeContact.advice || headFocus.advice || 'Good visual focus.'}</p>
                        </div>
                    </div>`;

                } catch (error) {
                    console.error(`❌ [Background] Error analyzing question ${i + 1}:`, error.message);
                }
            }

            // 3️⃣ حساب الأرقام النهائية وتحديث المقابلة
            const finalOverall = validQuestionsCount > 0 ? (totalOverall / validQuestionsCount).toFixed(1) : "0.0";
            const finalKnowledge = validQuestionsCount > 0 ? (totalKnowledge / validQuestionsCount).toFixed(1) : "0.0";
            const finalVerbal = validQuestionsCount > 0 ? (totalVerbal / validQuestionsCount).toFixed(1) : "0.0";
            const finalNonVerbal = validQuestionsCount > 0 ? (totalNonVerbal / validQuestionsCount).toFixed(1) : "0.0";

            let finalOverview = "Interview Completed.";
            if (parseFloat(finalOverall) >= 80) finalOverview = "Excellent performance! You demonstrated high proficiency.";
            else if (parseFloat(finalOverall) >= 60) finalOverview = "Good performance, but there is room for improvement.";
            else finalOverview = "Performance was below expectations. Significant improvements are needed.";
            
            try {
                // 💾 التحديث مباشرة في الداتابيز
                await Interview.update({
                    overall_score: Math.round(parseFloat(finalOverall)),
                    overall_feedback: finalOverview,
                    summary_data: { averages: { overall: finalOverall, knowledge: finalKnowledge, verbal: finalVerbal, nonVerbal: finalNonVerbal } }
                }, { where: { id: interviewId } });
            } catch (fErr) {
                console.error("❌ [Background] Error finalizing interview:", fErr.message);
            }

            const interviewRecord = await Interview.findOne({ 
                where: { id: interviewId },
                // بنجلب بيانات اليوزر كمان لو في علاقة (Relation) بينهم في الداتابيز
                include: User ? [User] : [] 
            });

            // استخراج البيانات وتجهيزها (وحطينا اسم افتراضي لو اليوزر مش متسجل)
            const candidateName = interviewRecord?.User?.name || "Nesreen Ahmed"; 
            const targetRole = interviewRecord?.target_role || "Not Specified";
            const expLevel = interviewRecord?.experience_level || "Not Specified";
            const intLang = interviewRecord?.language || "Not Specified";
            const questionsCount = files.length;
            
            // تنسيق التاريخ بشكل احترافي (مثال: Monday, June 22, 2026)
       const rawDate = interviewRecord?.createdAt || interviewRecord?.created_at || new Date();
            const interviewDate = new Date(rawDate).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });


            // 4️⃣ بناء الإيميل وإرساله
          const reportContent = `
            <div style="direction: ltr; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8fafc; color: #334155;">
                
                <div style="page-break-after: always; break-after: page; padding: 40px; text-align: center; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; min-height: 800px; display: flex; flex-direction: column; justify-content: center; margin-bottom: 20px;">
                    <div style="margin-top: 50px;">
                        <h1 style="color: #2F5D54; font-size: 38px; margin-bottom: 10px; letter-spacing: 1px;">Career AI Guide</h1>
                        <h2 style="color: #58A492; font-size: 22px; margin-top: 0; font-weight: 500;">Official Interview Assessment Report</h2>
                    </div>
                    
                    <div style="margin: 60px auto; background-color: #f0f7f5; border-left: 5px solid #2F5D54; border-radius: 8px; padding: 30px; text-align: left; width: 85%; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                        <h3 style="color: #2F5D54; border-bottom: 2px solid #dbece8; padding-bottom: 12px; margin-top: 0; font-size: 20px;">📋 Interview Details</h3>
                        <table style="width: 100%; font-size: 16px; color: #475569; line-height: 2.2;">
                            <tr>
                                <td style="font-weight: 700; width: 45%; color: #2F5D54;">Candidate Name:</td>
                                <td style="font-weight: 600;">${candidateName}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #2F5D54;">Target Role:</td>
                                <td>${targetRole}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #2F5D54;">Experience Level:</td>
                                <td>${expLevel}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #2F5D54;">Language:</td>
                                <td>${intLang}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #2F5D54;">Total Questions:</td>
                                <td>${questionsCount}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 700; color: #2F5D54;">Date:</td>
                                <td>${interviewDate}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #2F5D54; margin-bottom: 5px; font-size: 26px;">Performance Overview</h2>
                    </div>
                    
                    <div style="background-color: #ffffff; border-left: 4px solid #58a492; padding: 20px; margin: 20px 0; border-radius: 8px; font-size: 15px; line-height: 1.6; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                        <strong style="color: #2F5D54; font-size: 16px;">🎯 Executive Summary:</strong><br/>
                        <span style="color: #475569; display: inline-block; margin-top: 5px;">${finalOverview}</span>
                    </div>
                    
                    <table style="page-break-inside: avoid; break-inside: avoid; width: 100%; border-collapse: collapse; margin: 25px 0; text-align: center; font-size: 14px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
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
                                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; color: #58a492; font-size: 20px;">${finalOverall}%</td>
                                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${finalKnowledge}%</td>
                                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${finalVerbal}%</td>
                                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-size: 16px;">${finalNonVerbal}%</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 style="page-break-before: always; break-before: page; color: #2F5D54; margin-top: 0; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">📊 Detailed Question-by-Question Metrics</h3>
                    <div>
                        ${questionsHtml || '<p style="color: #64748b; text-align: center;">No detailed questions analyzed.</p>'}
                    </div>
                    
                    <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        This comprehensive analytics report was securely generated by the Career AI Guide Engine.
                    </div>
                </div>
            </div>`;

            await sendInterviewReport(email, interviewId, finalOverall, reportContent); 
            console.log("🎉 Background process and Email delivery fully completed!");
        };

        processInterview().catch(err => console.error("Background Process Error:", err));

    } catch (error) {
        console.error("Route Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to start background analysis." });
        }
    }
};