const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. استدعاء الإعدادات
const sequelize = require('./backend/config/database');

// 2. استدعاء الموديلات وتفعيل العلاقات (مهم جداً)
const User = require('./backend/models/User'); 
const Department = require('./backend/models/Department'); 
const DepartmentName = require('./backend/models/DepartmentName'); 
// استدعاء ملف تجميع موديلات الروود ماب وعلاقاتها
const { Roadmap, TechSkill, SkillResource } = require('./backend/models/Roadmap_models'); 

// 3. استدعاء الـ Routes
const authRoutes = require('./backend/routes/authRoutes');
const deptRoutes = require('./backend/routes/deptRoutes');
const roadmapRoutes = require('./backend/routes/roadmapRoutes'); // تأكدي من المسار

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
app.use('/api/departments', deptRoutes);
app.use('/api/roadmaps', roadmapRoutes);

// 6. إعداد العلاقات الإضافية
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

// 8. التشغيل
sequelize.sync().then(async () => {
    console.log('✅ Sequelize: Database models synced.');
    await verifySystemHealth();
    app.listen(PORT, () => {
        console.log(`🚀 Server is active on: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Sync Error:', err.message);
});