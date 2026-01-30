const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. استدعاء الإعدادات والموديلات
const sequelize = require('./backend/config/database');
const User = require('./backend/models/User'); 
const Department = require('./backend/models/Department'); 
const DepartmentName = require('./backend/models/DepartmentName'); 

// 2. استدعاء الـ Routes
const authRoutes = require('./backend/routes/authRoutes');
const deptRoutes = require('./backend/routes/deptRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 3. حل مشكلة الـ CORS (الأمان) - ضروري جداً لربط بورت 3000 بـ 5000
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // مهم لقراءة الـ FormData من الصور
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. ربط المسارات
app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);

// 5. إعداد العلاقات بين الجداول
User.belongsTo(DepartmentName, { foreignKey: 'department_name', targetKey: 'name' });

// 6. دالة الفحص الشاملة (Audit) للتأكد من قاعدة البيانات
async function verifySystemHealth() {
    console.log("\n🔍 --- CareerNode System Audit ---");
    try {
        const users = await User.count();
        console.log(`✅ Users Table: Connected. (${users} users registered)`);

        const courses = await Department.count();
        console.log(`✅ Courses Table: Connected. (${courses} courses found)`);

        const depts = await DepartmentName.findAll();
        console.log(`✅ Dept Names Table: Connected. Found: [${depts.map(d => d.name).join(', ')}]`);
        
        console.log("🚀 System Status: All Nominal.\n");
    } catch (error) {
        console.error("❌ Audit Failed:", error.message);
    }
}

// 7. تشغيل السيرفر والمزامنة مع Supabase
sequelize.sync().then(async () => {
    console.log('✅ Sequelize: Database models synced.');
    await verifySystemHealth();
    app.listen(PORT, () => {
        console.log(`🚀 Server is active on: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Sync Error:', err.message);
});