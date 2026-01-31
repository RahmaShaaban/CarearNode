const Roadmap = require('./Roadmap');
const TechSkill = require('./TechSkill');
const SkillResource = require('./SkillResource');
const RoadmapSkill = require('./RoadmapSkill');

// 1. علاقة Many-to-Many بين Roadmap و TechSkill
// نستخدم جدول RoadmapSkill كـ "جسر"
Roadmap.belongsToMany(TechSkill, { 
    through: RoadmapSkill, 
    foreignKey: 'roadmap_id', 
    otherKey: 'skill_id' 
});
TechSkill.belongsToMany(Roadmap, { 
    through: RoadmapSkill, 
    foreignKey: 'skill_id', 
    otherKey: 'roadmap_id' 
});

// 2. علاقة One-to-Many بين TechSkill و SkillResource
// المهارة الواحدة لها مصادر كثيرة
TechSkill.hasMany(SkillResource, { foreignKey: 'skill_id' });
SkillResource.belongsTo(TechSkill, { foreignKey: 'skill_id' });

module.exports = {
    Roadmap,
    TechSkill,
    SkillResource,
    RoadmapSkill
};
