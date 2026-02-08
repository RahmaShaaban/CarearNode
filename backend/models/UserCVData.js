const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UserCVData', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        personal_info: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        experience: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        education: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        skills: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        custom_sections: { // 🆕 العمود الجديد
            type: DataTypes.JSONB,
            defaultValue: []
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        selected_template_id: {
            type: DataTypes.STRING,
            defaultValue: 'classic-1'
        },
        template_settings: { // 🆕 العمود الجديد
            type: DataTypes.JSONB,
            defaultValue: { color: "#000000", image_position: "left" }
        }
    }, {
        tableName: 'user_cv_builder_data',
        timestamps: true // Sequelize هيستخدم createdAt و updatedAt اللي عملناهم
    });
};

