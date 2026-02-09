const Roadmap = require('./Roadmap');
const Steps = require('./Steps');
const StepResources = require('./StepResources');
const Roadmap_steps = require('./Roadmap_steps');

// 1. استدعاء الموديلات الجديدة (المهمة جداً عشان الجدول يظهر)
const UserRoadmap = require('./UserRoadmap');
const User = require('./User'); 

// --- العلاقات القديمة (زي ما هي) ---
Roadmap.belongsToMany(Steps, { 
    through: Roadmap_steps, 
    foreignKey: 'roadmap_id', 
    otherKey: 'step_id' 
});
Steps.belongsToMany(Roadmap, { 
    through: Roadmap_steps, 
    foreignKey: 'step_id', 
    otherKey: 'roadmap_id' 
});

Steps.hasMany(StepResources, { foreignKey: 'step_id' });
StepResources.belongsTo(Steps, { foreignKey: 'step_id' });


// --- 2. إضافة علاقات جدول التتبع (عشان الجدول يتعمل) ---

// اليوزر الواحد ممكن يكون له اشتراكات كتير
User.hasMany(UserRoadmap, { foreignKey: 'userId' });
UserRoadmap.belongsTo(User, { foreignKey: 'userId' });

// الرودماب الواحدة ممكن يشترك فيها يوزرز كتير
Roadmap.hasMany(UserRoadmap, { foreignKey: 'roadmapId' });
UserRoadmap.belongsTo(Roadmap, { foreignKey: 'roadmapId' });


module.exports = {
    Roadmap,
    Step:Steps,
    StepResources,
    RoadmapSteps:Roadmap_steps,
    // 3. تصدير الموديلات الجديدة عشان الكنترولر يشوفهم
    UserRoadmap,
    User
};
