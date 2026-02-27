const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
    const UserStepProgress = sequelize.define('UserStepProgress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { 
                model: 'users', // اسم جدول المستخدمين في الداتابيز
                key: 'id' 
            }
        },
        roadmapId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { 
                model: 'road_maps', // تأكدي من اسم جدول الـ Roadmap عندك
                key: 'id' 
            }
        },
        stepId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { 
                model: 'steps', // تأكدي من اسم جدول الخطوات (Steps)
                key: 'id' 
            }
        },
        quizScore: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'user_step_progress',
        timestamps: true
    });

    return UserStepProgress;
};