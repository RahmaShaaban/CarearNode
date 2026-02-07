const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('CV', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        raw_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        analysis_result: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'cv_analyses',
        // ✅ التعديل هنا: الغاء تفعيل اعمدة الوقت لانها غير موجودة في الجدول
        timestamps: false 
    });
};