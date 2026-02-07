const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
// ============================================================
// 1. استدعاء الموديلات (Import Models)
// ============================================================
const Subject = require('./Subject'); 
const TechSkill = require('./TechSkill');
const User = require('./User'); 

// --- الإضافات الجديدة (The New Part) ---
const DepartmentName = require('./DepartmentName');
const Job = require('./Job');
const DepartmentSubject = require('./DepartmentSubject'); // مهم للـ Controller

//////////////// CV Analysis Model //////////////
const CV = require('./CV')(sequelize, DataTypes); //


// ============================================================
// 2. تعريف الجداول الوسيطة (Intermediate Tables)
// ============================================================

// أ. جدول ربط المواد بالمهارات (SubjectSkill) - الكود القديم كما هو
const SubjectSkill = sequelize.define('SubjectSkill', {
  subject_id: {
    type: DataTypes.INTEGER,
    references: { model: Subject, key: 'id' }
  },
  skill_id: {
    type: DataTypes.INTEGER,
    references: { model: TechSkill, key: 'id' }
  }
}, { 
  tableName: 'subject_skills', 
  timestamps: false 
});

////////////////// CV Analysis ////////
User.hasOne(CV, { foreignKey: 'user_id', as: 'cvAnalysis' }); //
CV.belongsTo(User, { foreignKey: 'user_id', as: 'user' }); //

// ============================================================
// 3. بناء العلاقات (Associations)
// ============================================================

// --- الجزء القديم (Old Part - Subject & Skills) ---
Subject.belongsToMany(TechSkill, { 
  through: SubjectSkill, 
  as: 'skills', 
  foreignKey: 'subject_id'
});

TechSkill.belongsToMany(Subject, { 
  through: SubjectSkill, 
  as: 'subjects', 
  foreignKey: 'skill_id'
});

// --- الجزء الجديد (New Part - Department, Jobs, & Skills) ---

// 1. علاقة القسم بالوظائف (Many-to-Many)
// الجدول الوسيط: job_departments
DepartmentName.belongsToMany(Job, { 
    through: 'job_departments', // اسم الجدول في الداتابيز
    foreignKey: 'department_name', // العمود اللي بيربط بالقسم
    otherKey: 'job_id',            // العمود اللي بيربط بالوظيفة
    as: 'relatedJobs'              // الاسم اللي هنستخدمه في الكنترولر (include)
});

// (اختياري) العكس: الوظيفة تتبع لأقسام ايه؟
Job.belongsToMany(DepartmentName, {
    through: 'job_departments',
    foreignKey: 'job_id',
    otherKey: 'department_name',
    as: 'departments'
});

// 2. علاقة القسم بالمهارات (Many-to-Many)
// الجدول الوسيط: skills_for_department
DepartmentName.belongsToMany(TechSkill, { 
    through: 'skills_for_department', // اسم الجدول في الداتابيز
    foreignKey: 'department_name',
    otherKey: 'skill_id',
    as: 'deptSkills'               // الاسم اللي هنستخدمه في الكنترولر (include)
});

// (اختياري) العكس: المهارة موجودة في أقسام ايه؟
TechSkill.belongsToMany(DepartmentName, {
    through: 'skills_for_department',
    foreignKey: 'skill_id',
    otherKey: 'department_name',
    as: 'departments'
});

// ============================================================
// 4. التصدير (Exports)
// ============================================================
module.exports = { 
  sequelize, 
  Subject, 
  TechSkill,
  SubjectSkill, 
  User,
  CV,
  // تأكدي من وجود هؤلاء:
  DepartmentName,
  Job,
  DepartmentSubject
};