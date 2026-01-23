const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER
    },
    cv_url: {
        type: DataTypes.STRING
    },
    department_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'departments',
            key: 'id'
        }
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;