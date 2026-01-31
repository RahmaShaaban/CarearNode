const { Roadmap, TechSkill, SkillResource, RoadmapSkill } = require('../models/Roadmap_models');

exports.getRoadmapData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const roadmap = await Roadmap.findByPk(id, {
            include: [
                {
                    model: TechSkill,
                    through: { 
                        attributes: ['step_order'] // التأكد من جلب العمود
                    },
                    include: [SkillResource]
                }
            ],
            // التعديل هنا: نستخدم اسم الموديل بتاع جدول الربط بدقة
            order: [
                [TechSkill, RoadmapSkill, 'step_order', 'ASC']
            ]
        });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: "الخارطة غير موجودة" });
        }

        res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
        console.error("Error Detail:", error); // عشان نشوف التفاصيل في التيرمنال
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.findAll({
            attributes: ['id', 'title', 'description'] // مش محتاجين المهارات هنا عشان الـ Response يكون خفيف
        });
        res.status(200).json({ success: true, data: roadmaps });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};