const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoadmapSkill = sequelize.define('RoadmapSkill', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    roadmap_id: { type: DataTypes.BIGINT },
    skill_id: { type: DataTypes.BIGINT },
    step_order: { type: DataTypes.INTEGER }
}, { tableName: 'roadmap_skills', timestamps: false });

module.exports = RoadmapSkill;
