const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');      // تأكدي من المسار
const Roadmap = require('./Roadmap'); // تأكدي من المسار

const UserRoadmap = sequelize.define('UserRoadmap', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    // 1. ربط اليوزر (Foreign Key)
    userId: {
        type: DataTypes.INTEGER, // ⚠️ لازم INTEGER عشان يطابق جدول users (int4)
        allowNull: false,
        references: {
            model: User, // بيشاور على موديل User
            key: 'id'
        },
        onDelete: 'CASCADE', // لو اليوزر اتمسح، امسح تقدمه
        onUpdate: 'CASCADE'
    },
    // 2. ربط الرودماب (Foreign Key)
    roadmapId: {
        type: DataTypes.BIGINT, // ⚠️ لازم BIGINT عشان يطابق جدول road_maps (int8)
        allowNull: false,
        references: {
            model: Roadmap, // بيشاور على موديل Roadmap
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    // باقي البيانات
    completedSteps: {
        type: DataTypes.JSON, 
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'in-progress'
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'user_roadmaps', // اسم الجدول في الداتابيز
    timestamps: true 
});

module.exports = UserRoadmap;
