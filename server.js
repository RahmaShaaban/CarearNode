const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. استدعاء الإعدادات
const sequelize = require('./backend/config/database');

// 2. استدعاء الموديلات وتفعيل العلاقات
const User = require('./backend/models/User');
const Department = require('./backend/models/Department');
const DepartmentName = require('./backend/models/DepartmentName');
// استدعاء ملف تجميع موديلات الروود ماب وعلاقاتها
const { Roadmap, TechSkill, SkillResource } = require('./backend/models/Roadmap_models');

// 3. استدعاء الـ Routes
const authRoutes = require('./backend/routes/authRoutes');
const deptRoutes = require('./backend/routes/deptRoutes');
const roadmapRoutes = require('./backend/routes/roadmapRoutes');
// ... الاستدعاءات في الأعلى
const jobRoutes = require('./backend/routes/jobRoutes');



const app = express();
const PORT = process.env.PORT || 5000;

// 4. حل مشكلة الـ CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. ربط المسارات
app.use('/api/auth', authRoutes);

// >>> هام: استخدمنا dept بدل departments عشان يتوافق مع كود Department.js اللي لسه مصلحينه
app.use('/api/dept', deptRoutes);

// المسار الجديد للرودماب
app.use('/api/roadmaps', roadmapRoutes);

// ...
 // الرابط النهائي هيكون: http://localhost:5000/api/jobs
app.use('/api/jobs', jobRoutes);

// راوت تجريبي
app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});

// 6. إعداد العلاقات الإضافية (من التحديث الجديد)
User.belongsTo(DepartmentName, { foreignKey: 'department_name', targetKey: 'name' });

// 7. دالة الفحص (Audit)
async function verifySystemHealth() {
    console.log("\n🔍 --- CareerNode System Audit ---");
    try {
        const users = await User.count();
        console.log(`✅ Users Table: Connected. (${users} users)`);

        const courses = await Department.count();
        console.log(`✅ Courses Table: Connected. (${courses} courses)`);

        // فحص سريع للروود ماب
        const roadmapsCount = await Roadmap.count();
        console.log(`✅ Roadmaps Table: Connected. (${roadmapsCount} roadmaps found)`);

        console.log("🚀 System Status: All Nominal.\n");
    } catch (error) {
        console.error("❌ Audit Failed:", error.message);
    }
}

// 8. تشغيل السيرفر والمزامنة
// استخدمنا alter: true عشان نحدث الجداول من غير ما نمسح البيانات
sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Database models synced successfully!');

    // تشغيل فحص النظام
    await verifySystemHealth();

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Sync Error:', err.message);
});