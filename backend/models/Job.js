const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
    id: {
         type: DataTypes.INTEGER, 
         primaryKey: true, 
         autoIncrement: true },
         
    title: { 
        type: DataTypes.STRING, 
        allowNull: false },

    description: { 
        type: DataTypes.TEXT }

}, 
{ tableName: 
    'jobs', timestamps: false });

module.exports = Job;