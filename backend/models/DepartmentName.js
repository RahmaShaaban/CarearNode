const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DepartmentName = sequelize.define('DepartmentName', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true,
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