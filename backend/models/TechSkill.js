const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechSkill = sequelize.define('TechSkill', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true },

    name: { 
        type: DataTypes.STRING, 
        allowNull: false } // في الداتابيز العمود اسمه name
         }, 

        { tableName: 'tech_skills', timestamps: false });

module.exports = TechSkill;