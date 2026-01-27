const express = require('express');
const cors = require('cors');
const path = require('path'); // عشان مسارات الفولدرات
require('dotenv').config();

// استدعاء ملفات الداتابيز
const sequelize = require('./backend/config/database');
const User = require('./backend/models/User'); 
const authRoutes = require('./backend/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. Middleware (الإعدادات) ---
app.use(cors());
app.use(express.json()); // عشان يفهم JSON

// إعداد فولدر الصور (الطريقة الآمنة)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Routes (المسارات) ---
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});

// --- 3. Database Sync & Server Start (التشغيل) ---
// alter: true -> بتعدل الجدول لو فيه تغييرات من غير ما تمسح البيانات
sequelize.sync({ alter: true }) 
    .then(async () => {
        console.log('✅ Database connected & tables updated successfully!');
        
        // تشغيل السيرفر مرة واحدة هنا بس
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

        // Test Connection (اختياري: عرض اليوزرز للتأكد)
        try {
            // const users = await User.findAll();
            // console.log("Current Users in DB:", users.length);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    })
    .catch(err => {
        console.error('❌ Database Connection Error:', err);
    });