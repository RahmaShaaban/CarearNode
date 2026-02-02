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
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department_name: {
        type: DataTypes.STRING,
        allowNull: true
    },

    about_me: {
        type: DataTypes.TEXT, // ?????? TEXT ???? ?????? ???? ????
        allowNull: true
    },
    // >>>>> 2. ????? ??? Role <<<<<
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Student" // ???? ????????
    }





}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;