const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 1. استدعاء الموديلات
const User = require('./User'); 
const Roadmap = require('./Roadmap');
const Steps = require('./Steps');
const StepResources = require('./StepResources');
const Roadmap_steps = require('./Roadmap_steps');
const UserRoadmap = require('./UserRoadmap');
const TechSkill = require('./TechSkill');
const Template = require('./Template'); // 🆕 أضيفي السطر ده هنا (تأكدي من اسم الملف)

// 2. الموديلات المعرفة كدوال (Functions)
const UserCVData = require('./UserCVData')(sequelize); 
const CV = require('./CV')(sequelize); 

// 3. تعريف العلاقات (Associations)

// ربط الـ User بالـ CV Builder والـ Analysis
User.belongsTo(UserCVData, { foreignKey: 'cv_id', as: 'builtCV' });
UserCVData.hasOne(User, { foreignKey: 'cv_id' });

User.belongsTo(CV, { foreignKey: 'cv_id_analysis', as: 'analyzedCV' });
CV.hasOne(User, { foreignKey: 'cv_id_analysis' });

// ربط الـ UserCVData بالـ Template (عشان الـ View & Download يشتغلوا)
UserCVData.belongsTo(Template, { foreignKey: 'selected_template_id', as: 'template' });
Template.hasMany(UserCVData, { foreignKey: 'selected_template_id' });

// علاقات الـ Roadmap (كما هي)
User.hasMany(UserRoadmap, { foreignKey: 'userId' });
UserRoadmap.belongsTo(User, { foreignKey: 'userId' });
Roadmap.hasMany(UserRoadmap, { foreignKey: 'roadmapId' });
UserRoadmap.belongsTo(Roadmap, { foreignKey: 'roadmapId' });
Roadmap.belongsToMany(Steps, { through: Roadmap_steps, foreignKey: 'roadmap_id', otherKey: 'step_id' });
Steps.belongsToMany(Roadmap, { through: Roadmap_steps, foreignKey: 'step_id', otherKey: 'roadmap_id' });

// 4. التصدير (Export)
module.exports = {
    sequelize,
    User,
    Roadmap,
    Step: Steps,
    StepResources,
    RoadmapSteps: Roadmap_steps,
    UserRoadmap,
    TechSkill,
    Template, // 🆕 لازم يكون موجود هنا عشان الـ Controller يشوفه
    UserCVData,
  
    CV
};