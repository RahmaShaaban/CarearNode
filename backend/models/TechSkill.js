const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechSkill = sequelize.define('TechSkill', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
}, { tableName: 'tech_skills', timestamps: false });

module.exports = TechSkill;
