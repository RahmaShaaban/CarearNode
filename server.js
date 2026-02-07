const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


////////// CV Analysis //////////
const cvRoutes = require('./backend/routes/cvRoutes'); //
//////////// CV Builder //////////
const cvBuilderRoutes = require('./backend/routes/cvBuilderRoutes');

// استدعاء ملف الاتصال بالداتابيز
const sequelize = require('./backend/config/database');
////
                  const User = require('./backend/models/User');
                  const DepartmentName = require('./backend/models/DepartmentName');
                  const { Roadmap, TechSkill, SkillResource } = require('./backend/models/Roadmap_models');

////
const app = express();

// 1. تفعيل CORS للجميع (لحل أي مشكلة ربط مؤقتاً) ✅
app.use(cors({
    origin: 'http://localhost:3000', // السماح لأي مصدر بالاتصال (للأمان أثناء التطوير)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
////////////// CV Builder //////////////
app.use('/api/cv-builder', cvBuilderRoutes);


//////////////
         app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//////////////

///////////// 2. كاشف الطلبات (Logger) - عشان نشوف الفرونت بيكلم الباك ولا لأ 🕵️‍♂️
// راوت تجريبي
app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});
////////////

// استدعاء الراوتس (تأكدي أن المسارات صحيحة)
const deptRoutes = require('./backend/routes/deptRoutes');
const subjectRoutes = require('./backend/routes/subjectRoutes');
////////////
                const authRoutes = require('./backend/routes/authRoutes');
                const jobRoutes = require('./backend/routes/jobRoutes');
                const roadmapRoutes = require('./backend/routes/roadmapRoutes');

////////////
//////////////// CV Analysis  /////////////
app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads/cvs'))); //

// ربط المسارات
app.use('/api/dept', deptRoutes);
app.use('/api/subjects', subjectRoutes);
////////////
             app.use('/api/auth', authRoutes);
             app.use('/api/jobs', jobRoutes);
             app.use('/api/roadmaps', roadmapRoutes);
////////////
/////////// CV Analysis /////////////
app.use('/api/cv', cvRoutes); //
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