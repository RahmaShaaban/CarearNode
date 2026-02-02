const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// 1. استدعاء ملف الاتصال بالداتابيز (تأكدي من المسار)
// لو ملف الاتصال بتاعك في config/database.js عدلي المسار هنا
const sequelize = require('../config/database'); 

// 2. استدعاء الموديلز (Models) بتاعتك
// لازم تستدعيهم كلهم هنا عشان السكريبت يشوفهم
const Job = require('../models/Job');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap'); 
const TechSkill = require('../models/TechSkill'); // لو عندك
const SkillResource = require('../models/SkillResource'); // لو عندك

// 3. ترتيب الجداول مهم جداً في الاسترجاع (عشان العلاقات)
// نبدأ بالحاجات المستقلة (زي Job) وبعدين اللي بيعتمد عليها (زي User)
const models = {
    Job,
    User,
    Roadmap,
    TechSkill,
    SkillResource
};

// مسار ملف الباك أب
const backupPath = path.join(__dirname, 'backups', 'full_backup.json');

// --- دالة النسخ الاحتياطي (Backup) ---
async function backup() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Connected to DB. Starting Backup...');

        const allData = {};

        for (const [name, model] of Object.entries(models)) {
            if (model) {
                const data = await model.findAll();
                allData[name] = data.map(d => d.toJSON()); // تحويل لـ JSON نظيف
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

        // نمشي بالترتيب عشان العلاقات (Foreign Keys)
        // الأول نمسح الداتا القديمة (اختياري - بس عشان التكرار)
        // await sequelize.sync({ force: true }); // ⚠️ ده بيمسح كل حاجة ويبنيها تاني

        for (const [name, model] of Object.entries(models)) {
            if (model && allData[name] && allData[name].length > 0) {
                try {
                    // ignoreDuplicates: true >> عشان لو الداتا موجودة ميعملش Error
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

// التحكم في التشغيل عن طريق الـ Terminal
const args = process.argv.slice(2);
if (args[0] === 'backup') {
    backup();
} else if (args[0] === 'restore') {
    restore();
} else {
    console.log('Please specify command: node scripts/dataManager.js [backup|restore]');
}

