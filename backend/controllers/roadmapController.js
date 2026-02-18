// 1. استدعاء الموديلات بأسماء صحيحة بناءً على ملف Roadmap_models.js
const { 
    Roadmap, 
    Step,             // كان Steps/TechSkill
    StepResources,    // كان SkillResource
    RoadmapSteps,     // كان RoadmapSkill (الجدول الوسيط)
    UserRoadmap       // الموديل الجديد للتتبع
} = require('../models/Roadmap_models');

// ---------------------------------------------------------
// دوال التتبع والاشتراك (الجزء الجديد)
// ---------------------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateStepQuiz = async (req, res) => {
    try {
        const { stepId } = req.params;

        // 1. جلب "step_name" بدلاً من "title"
        const step = await Step.findByPk(stepId, {
            attributes: ['step_name'] // ✅ عدلنا الاسم هنا
        });

        if (!step) return res.status(404).json({ success: false, message: "Step not found" });

        // 2. إعداد الموديل
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        // 3. نستخدم step.step_name في الـ Prompt
        const prompt = `You are an educational expert. Create a beginner-level quiz with 5 multiple-choice questions (MCQs) in English about the topic: "${step.step_name}".
        Return ONLY a JSON array with this exact structure:
        [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correct_answer": index (0-3)
          }
        ]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // 4. تحويل النص لـ JSON
        const quizData = JSON.parse(responseText);

        res.status(200).json({
            success: true,
            topic: step.step_name,
            quiz: quizData
        });

    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.submitStepQuiz = async (req, res) => {
    try {
        const { userId, roadmapId, stepId, score } = req.body; 

        // 1. تحديد حالة النجاح
        const isPassed = score >= 50;

        // 2. تحديث أو إنشاء سجل التقدم (استخدام findOne + create/update أضمن في حالتك)
        let progress = await UserStepProgress.findOne({
            where: { userId, roadmapId, stepId }
        });

        if (progress) {
            await progress.update({ quizScore: score, isCompleted: isPassed });
        } else {
            await UserStepProgress.create({
                userId, roadmapId, stepId, quizScore: score, isCompleted: isPassed
            });
        }

        // 3. تحديث جدول UserRoadmap القديم لضمان توافق البيانات
        if (isPassed) {
            const enrollment = await UserRoadmap.findOne({ where: { userId, roadmapId } });
            
            if (enrollment) {
                // التأكد من أن completedSteps عبارة عن مصفوفة
                let completed = Array.isArray(enrollment.completedSteps) ? enrollment.completedSteps : [];
                
                const stepIdNum = Number(stepId);
                if (!completed.includes(stepIdNum)) {
                    completed.push(stepIdNum);
                    
                    // نحدث المصفوفة (Sequelize يحتاج أحياناً إعلامه بتغيير الـ JSON)
                    enrollment.completedSteps = completed;
                    enrollment.changed('completedSteps', true); 

                    // حساب النسبة الجديدة بناءً على عدد الخطوات الكلي
                    const roadmap = await Roadmap.findByPk(roadmapId, { 
                        include: [{ model: Step, as: 'Steps' }] // تأكدي من الـ alias 'Steps'
                    });

                    if (roadmap && roadmap.Steps) {
                        const totalSteps = roadmap.Steps.length;
                        enrollment.progress = Math.round((completed.length / totalSteps) * 100);
                    }
                    
                    await enrollment.save();
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            passed: isPassed, 
            score,
            message: isPassed ? "Excellent! You passed the step successfully ✅" : "You need to review the step and try again ❌" 
        });

    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
// 1. دالة الاشتراك (Enroll)
exports.enrollRoadmap = async (req, res) => {
    try {
        const { userId, roadmapId } = req.body;

        // نتأكد الأول إنه مش مشترك بالفعل
        let enrollment = await UserRoadmap.findOne({
            where: { userId, roadmapId }
        });

        if (enrollment) {
            return res.status(400).json({ success: false, message: "Already enrolled" });
        }

        // إنشاء اشتراك جديد
        enrollment = await UserRoadmap.create({
            userId,
            roadmapId,
            completedSteps: [], // مصفوفة فاضية في البداية
            progress: 0,
            status: 'in-progress'
        });

        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        console.error("Enroll Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. دالة معرفة حالة اليوزر (عشان الفرونت يعرف يظهر زرار Start ولا Continue)
exports.getUserRoadmapStatus = async (req, res) => {
    try {
        const { roadmapId, userId } = req.params;

        const enrollment = await UserRoadmap.findOne({
            where: { userId, roadmapId }
        });

        if (!enrollment) {
            return res.status(200).json({ enrolled: false });
        }

        res.status(200).json({
            enrolled: true,
            completedSteps: enrollment.completedSteps || [],
            progress: enrollment.progress
        });
    } catch (error) {
        console.error("Status Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. دالة تحديث التقدم (لما يدوس على Checkbox)
exports.updateProgress = async (req, res) => {
    try {
        const { userId, roadmapId, completedSteps } = req.body;

        // نجيب الاشتراك
        const enrollment = await UserRoadmap.findOne({ where: { userId, roadmapId } });
        
        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        // حساب النسبة المئوية
        // لازم نعرف عدد الخطوات الكلي في الرودماب دي عشان نحسب النسبة
        const roadmap = await Roadmap.findByPk(roadmapId, {
            include: [{ model: Step }] 
        });

        const totalSteps = roadmap.Steps ? roadmap.Steps.length : 0;
        let progressPercent = 0;
        
        if (totalSteps > 0) {
            progressPercent = Math.round((completedSteps.length / totalSteps) * 100);
        }

        // تحديث الداتابيز
        enrollment.completedSteps = completedSteps;
        enrollment.progress = progressPercent;
        
        // لو خلص كل الخطوات نغير الحالة لـ completed
        if (progressPercent === 100) enrollment.status = 'completed';
        else enrollment.status = 'in-progress';
        
        await enrollment.save();

        res.status(200).json({ success: true, progress: progressPercent });
    } catch (error) {
        console.error("Progress Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ---------------------------------------------------------
// دوال عرض الرودماب (الجزء المعدل)
// ---------------------------------------------------------

// جلب تفاصيل رودماب واحدة (للصفحة الداخلية)
exports.getRoadmapData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const roadmap = await Roadmap.findByPk(id, {
            include: [
                {
                    model: Step, // استخدام الاسم الجديد Step
                    through: { 
                        attributes: ['step_order'] // جلب الترتيب من الجدول الوسيط
                    },
                    include: [StepResources] // استخدام الاسم الجديد للمصادر
                }
            ],
            // الترتيب باستخدام الجدول الوسيط RoadmapSteps وعمود step_order
            order: [
                [Step, RoadmapSteps, 'step_order', 'ASC']
            ]
        });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: "الخارطة غير موجودة" });
        }

        res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
        console.error("Error Detail:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// جلب كل الرودمابس (للصفحة الخارجية) - تم التعديل لجلب عدد الخطوات
exports.getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.findAll({
            attributes: ['id', 'title', 'description'],
            // الإضافة الجديدة: بنجيب جدول الخطوات عشان نعدهم في الفرونت
            include: [
                {
                    model: Step,
                    attributes: ['id'], // بنجيب الـ id بس عشان نخفف الحمل
                    through: { attributes: [] } // مش عايزين بيانات الجدول الوسيط هنا
                }
            ]
        });
        res.status(200).json({ success: true, data: roadmaps });
    } catch (error) {
        console.error("GetAllRoadmaps Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. دالة إلغاء الاشتراك (Unenroll)
exports.unenrollRoadmap = async (req, res) => {
    try {
        // ممكن نستقبل البيانات من body أو query، هنا هنستخدم body زي الـ enroll
        const { userId, roadmapId } = req.body; 

        const deleted = await UserRoadmap.destroy({
            where: { userId, roadmapId }
        });

        if (deleted) {
            res.status(200).json({ success: true, message: "Unenrolled successfully" });
        } else {
            res.status(404).json({ success: false, message: "Enrollment not found" });
        }
    } catch (error) {
        console.error("Unenroll Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};