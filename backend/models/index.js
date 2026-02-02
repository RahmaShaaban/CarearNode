const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 1. استدعاء الموديلات الأساسية (التي لها ملفات بالفعل)
const Subject = require('./Subject'); 
const TechSkill = require('./TechSkill');
const User = require('./User'); // إذا كنتِ تحتاجينه هنا
// استدعاء باقي الموديلات حسب الحاجة...

// 2. تعريف "جدول الربط" (Inline Definition)
// هذا الجزء هو بديل إنشاء ملف SubjectSkill.js
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
  tableName: 'subject_skills', // تأكدي أن هذا الاسم يطابق اسم الجدول في Supabase
  timestamps: false 
});

// 3. بناء العلاقات (Associations)
// العلاقة: المادة لها مهارات كثيرة
Subject.belongsToMany(TechSkill, { 
  through: SubjectSkill, // نستخدم الموديل المعرف أعلاه
  as: 'skills', // هذا الاسم هو الذي ستستخدمينه في الـ Controller (include: 'skills')
  foreignKey: 'subject_id'
});

// العلاقة: المهارة موجودة في مواد كثيرة
TechSkill.belongsToMany(Subject, { 
  through: SubjectSkill, 
  as: 'subjects', 
  foreignKey: 'skill_id'
});

// 4. تصدير الموديلات لتستخدميها في باقي المشروع
module.exports = { 
  sequelize, 
  Subject, 
  TechSkill,
  SubjectSkill, // نصدره أيضاً لو احتجنا نستخدمه
  User 
};