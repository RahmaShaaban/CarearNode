const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// 1. تصحيح المسار: لازم ندخل فولدر backend الأول
const sequelize = require('../backend/config/database'); 

// 2. تصحيح مسارات المودلز: برضه جوه فولدر backend
const Job = require('../backend/models/Job');
const User = require('../backend/models/User');
// لاحظي هنا استدعيت الرودماب زي ما هي معمولة في السيرفر عندك
const { Roadmap, TechSkill, SkillResource } = require('../backend/models/Roadmap_models');
// لو فيه مودلز تانية زي Department ضيفيها هنا بنفس الطريقة
const Department = require('../backend/models/Department');

// 3. تجميع المودلز
const models = {
    Job,
    User,
    Department,
    Roadmap,
    TechSkill,
    SkillResource
};

// مسار حفظ ملف الباك أب (هيفضل زي ما هو جوه scripts/backups)
const backupPath = path.join(__dirname, 'backups', 'full_backup.json');

// --- دالة النسخ الاحتياطي (Backup) ---
async function backup() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to DB. Starting Backup...');

        const allData = {};

        // التأكد من إنشاء فولدر backups لو مش موجود
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const [name, model] of Object.entries(models)) {
            if (model) {
                const data = await model.findAll();
                allData[name] = data.map(d => d.toJSON());
                console.log(`📦 Backed up ${data.length} records from ${name}`);
            }
        }

        fs.writeFileSync(backupPath, JSON.stringify(allData, null, 2));
        console.log(`✅ Backup saved successfully to: ${backupPath}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

// --- دالة الاسترجاع (Restore) ---
async function restore() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to DB. Starting Restore...');

        if (!fs.existsSync(backupPath)) {
            console.error('❌ No backup file found!');
            process.exit(1);
        }

        const fileData = fs.readFileSync(backupPath, 'utf8');
        const allData = JSON.parse(fileData);

        // الترتيب مهم: نبدأ بالجداول الأساسية
        // ممكن تحتاجي تعدلي الترتيب ده حسب العلاقات عندك
        const restoreOrder = ['Job', 'Department', 'User', 'Roadmap', 'TechSkill', 'SkillResource'];

        for (const name of restoreOrder) {
            const model = models[name];
            if (model && allData[name] && allData[name].length > 0) {
                try {
                    await model.bulkCreate(allData[name], { ignoreDuplicates: true });
                    console.log(`♻️ Restored ${allData[name].length} records to ${name}`);
                } catch (err) {
                    console.error(`⚠️ Error restoring ${name}:`, err.message);
                }
            }
        }

        console.log('✅ Restore completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Restore failed:', error);
        process.exit(1);
    }
}

// التحكم في التشغيل
const args = process.argv.slice(2);
if (args[0] === 'backup') {
    backup();
} else if (args[0] === 'restore') {
    restore();
} else {
    console.log('Please specify command: node scripts/dataManager.js [backup|restore]');
}