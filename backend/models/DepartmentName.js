const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepartmentName = sequelize.define('DepartmentName', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true, // الاسم هو المفتاح الأساسي حسب الداتابيز
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'departments_name',
    timestamps: false
});

module.exports = DepartmentName;