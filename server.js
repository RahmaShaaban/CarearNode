const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. استدعاء الإعدادات والموديلات (مرة واحدة فقط لكل ملف)
const sequelize = require('./backend/config/database');
const User = require('./backend/models/User'); 
const Department = require('./backend/models/Department');

// 2. استدعاء المسارات (Routes)
const authRoutes = require('./backend/routes/authRoutes');
const deptRoutes = require('./backend/routes/deptRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 3. Middleware (الإعدادات) ---
app.use(cors());
app.use(express.json());

// إعداد فولدر الصور للبروفايل
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. Routes (المسارات) ---
app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);

app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});

// --- 5. وظائف الاختبار (للتأكد من البيانات المرفوعة) ---
async function testConnection() {
    try {
        const users = await User.findAll();
        console.log("✅ Connection Successful! Found users:");
        console.table(users.map(u => ({ id: u.id, name: u.full_name, image: u.profile_image })));
        
        const deptCount = await Department.count();
        console.log(`✅ Found ${deptCount} courses in the Department table.`);
    } catch (error) {
        console.error("❌ Connection Error during testing:", error.message);
    }
}

// --- 6. تشغيل السيرفر والمزامنة ---
// نستخدم alter: true لتعديل الجداول في Supabase دون مسح البيانات الحالية
sequelize.sync({ alter: true }) 
    .then(async () => {
        console.log('✅ Database connected & tables updated successfully!');
        
        // تشغيل الاختبار للتأكد من وجود البيانات
        await testConnection();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Sync error:', err.message);
    });