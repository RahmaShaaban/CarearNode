// models/Template.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // المسار حسب إعداداتك

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preview_image: DataTypes.TEXT,
  primary_color: DataTypes.STRING,
  secondary_color: DataTypes.STRING,
  font_family: DataTypes.STRING,
  layout_type: DataTypes.STRING,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'templates',
  timestamps: false
});

module.exports = Template;
