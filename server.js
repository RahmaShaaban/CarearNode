const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// استدعاء ملف الاتصال بالداتابيز
const sequelize = require('./backend/config/database');

const app = express();

// 1. تفعيل CORS للجميع (لحل أي مشكلة ربط مؤقتاً) ✅
app.use(cors({
    origin: '*', // السماح لأي مصدر بالاتصال (للأمان أثناء التطوير)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. كاشف الطلبات (Logger) - عشان نشوف الفرونت بيكلم الباك ولا لأ 🕵️‍♂️
app.use((req, res, next) => {
    console.log(`🔔 Request received: ${req.method} ${req.url}`);
    next();
});

// استدعاء الراوتس (تأكدي أن المسارات صحيحة)
const deptRoutes = require('./backend/routes/deptRoutes');
const subjectRoutes = require('./backend/routes/subjectRoutes');

// ربط المسارات
app.use('/api/dept', deptRoutes);
app.use('/api/subjects', subjectRoutes);

// مسار تجريبي للتأكد أن السيرفر شغال
app.get('/', (req, res) => {
    res.send('✅ Server is running perfectly!');
});

const PORT = process.env.PORT || 5000;

// تشغيل السيرفر
sequelize.sync().then(() => {
    console.log('✅ Database Connected & Synced');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database Connection Error:', err.message);
});