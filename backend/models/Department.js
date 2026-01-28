const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    department: { 
        type: DataTypes.STRING,
        allowNull: true 
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    brief_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    technical_skills: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'departments',
    timestamps: false
});

module.exports = Department;