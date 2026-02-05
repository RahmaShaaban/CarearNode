const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Roadmap_steps = sequelize.define('Roadmap_steps', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    roadmap_id: { type: DataTypes.BIGINT },
    step_id: { type: DataTypes.BIGINT },
    step_order: { type: DataTypes.INTEGER }
}, { tableName: 'roadmap_steps', timestamps: false });

module.exports = Roadmap_steps;
