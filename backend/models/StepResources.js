const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StepResources = sequelize.define('StepResources', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    step_id: { type: DataTypes.BIGINT },
    resource_name: { type: DataTypes.STRING },
    url: { type: DataTypes.TEXT },
    resource_type: { type: DataTypes.STRING }
}, { tableName: 'step_resources', timestamps: false });

module.exports = StepResources;
