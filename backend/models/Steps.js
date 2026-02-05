const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // مسار ملف الاتصال بقاعدة البيانات عندك

const Step = sequelize.define('Step', {
  // تعريف الـ id كـ Primary Key ونوعه Integer (int8)
  id: {
    type: DataTypes.BIGINT, // BIGINT تقابل int8
    primaryKey: true,
    autoIncrement: true
  },
  // تعريف الـ step_name ونوعه Text
  step_name: {
    type: DataTypes.TEXT,
    allowNull: false // حسب الصورة العلامة السوداء تعني أنه مطلوب
  }
}, {
  tableName: 'steps', // التأكد من اسم الجدول كما في الصورة
  timestamps: false    // لو مش حاطة أعمدة الوقت (createdAt/updatedAt)
});

module.exports = Step;