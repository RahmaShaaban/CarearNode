const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechSkill = sequelize.define('TechSkill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  skill_name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'tech_skills',
  timestamps: false
});

module.exports = TechSkill;