const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SkillResource = sequelize.define('SkillResource', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    skill_id: { type: DataTypes.BIGINT },
    resource_name: { type: DataTypes.STRING },
    url: { type: DataTypes.TEXT },
    resource_type: { type: DataTypes.STRING }
}, { tableName: 'skill_resources', timestamps: false });

module.exports = SkillResource;
