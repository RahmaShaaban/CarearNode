const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // تأكدي من مسار ملف الاتصال

const Job = sequelize.define('Job', {
    // حسب الصورة، الجدول فيه id و title
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'jobs', // اسم الجدول في الداتابيز كما في الصورة
    timestamps: false  // لو الجدول مفيهوش created_at و updated_at
});

module.exports = Job;