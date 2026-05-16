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
const Template = require('./Template'); 
const Job = require('./Job');

// 🆕 استدعاء موديلات المقابلة الشخصية
const Interview = require('./Interview');
const InterviewQuestion = require('./InterviewQuestion');

// استدعاء الموديلات اللي بتحتاج (sequelize, DataTypes) بشكل مباشر
const UserStepProgress = require('./UserStepProgress')(sequelize, DataTypes);
const UserCVData = require('./UserCVData')(sequelize); 
const CV = require('./CV')(sequelize); 

// 2. تعريف العلاقات (Associations)

// --- علاقات اليوزر والـ Roadmap والـ CV (اللي كانت عندك) ---
User.hasMany(UserStepProgress, { foreignKey: 'userId', as: 'stepProgress' });
UserStepProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserStepProgress.belongsTo(Roadmap, { foreignKey: 'roadmapId' });
UserStepProgress.belongsTo(Steps, { foreignKey: 'stepId' });

User.belongsTo(UserCVData, { foreignKey: 'cv_id', as: 'builtCV' });
UserCVData.hasOne(User, { foreignKey: 'cv_id' });

User.belongsTo(CV, { foreignKey: 'cv_id_analysis', as: 'analyzedCV' });
CV.hasOne(User, { foreignKey: 'cv_id_analysis' });

UserCVData.belongsTo(Template, { foreignKey: 'selected_template_id', as: 'template' });
Template.hasMany(UserCVData, { foreignKey: 'selected_template_id' });

User.hasMany(UserRoadmap, { foreignKey: 'userId' });
UserRoadmap.belongsTo(User, { foreignKey: 'userId' });

Roadmap.hasMany(UserRoadmap, { foreignKey: 'roadmapId' });
UserRoadmap.belongsTo(Roadmap, { foreignKey: 'roadmapId' });

Roadmap.belongsToMany(Steps, { through: Roadmap_steps, foreignKey: 'roadmap_id', otherKey: 'step_id' });
Steps.belongsToMany(Roadmap, { through: Roadmap_steps, foreignKey: 'step_id', otherKey: 'roadmap_id' });

Steps.hasMany(StepResources, { foreignKey: 'step_id' });
StepResources.belongsTo(Steps, { foreignKey: 'step_id' });

// 🆕 3. تعريف علاقات المقابلة الشخصية (Interview)
// ربط اليوزر بالمقابلات (اليوزر الواحد له مقابلات كتير)
User.hasMany(Interview, { foreignKey: 'user_id' });
Interview.belongsTo(User, { foreignKey: 'user_id' });

// ربط المقابلة بالأسئلة (المقابلة الواحدة ليها أسئلة كتير)
Interview.hasMany(InterviewQuestion, { foreignKey: 'interview_id', as: 'questions' });
InterviewQuestion.belongsTo(Interview, { foreignKey: 'interview_id' });


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
    Template,
    UserCVData,
    CV,
    Job,
    UserStepProgress,
    Interview,        // 🆕 تصدير موديل المقابلة
    InterviewQuestion // 🆕 تصدير موديل الأسئلة
};