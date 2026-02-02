const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // تأكدي من مسار ملف الاتصال

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'subjects',
  timestamps: false // لأننا لم نضف created_at في الـ SQL
});

module.exports = Subject;