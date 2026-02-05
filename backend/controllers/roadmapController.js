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