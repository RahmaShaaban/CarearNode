const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepartmentSubject = sequelize.define('DepartmentSubject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    department_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'department_subjects',
    timestamps: false
});

module.exports = DepartmentSubject;