const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. استدعاء الموديلات والاتصال بقاعدة البيانات
const sequelize = require('./config/database');
const User = require('./models/User');
const DepartmentName = require('./models/DepartmentName');
const { Roadmap, TechSkill, SkillResource } = require('./models/Roadmap_models');

// 2. تعريف تطبيق express (يجب أن يكون قبل أي app.use أو app.set)
const app = express();

// 3. إعداد محرك القوالب (EJS)
// تأكدي أن الفولدر اسمه templates وموجود داخل backend مباشرة
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'backend', 'templates')); 

// 4. الميدل وير (Middlewares)
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads/cvs')));

/////////////////////////////////////// للتأكد من أن القوالب (Templates) متاحة للعرض
app.use('/templates', express.static(path.join(__dirname, 'backend', 'templates')));


/* // 5. راوت التجربة (Test Route لـ CV)
// app.get('/test-sidebar-cv', (req, res) => {
//     const dummyData = {
//         personal_info: {
//             full_name: "سارة أحمد",
//             job_title: "Full Stack Developer",
//             email: "sara@example.com",
//             phone: "0123456789",
//             location: "القاهرة، مصر",
//             linkedin: "linkedin.com/in/sara",
//             github: "github.com/sara"
//         },
//         summary: "مطورة برمجيات شغوفة ببناء تطبيقات الويب باستخدام Node.js و React.",
//         skills: ["Node.js", "Express", "React", "PostgreSQL", "Git"],
//         experience: [
//             {
//                 job_title: "Junior Developer",
//                 company: "Tech Solutions",
//                 start_date: "2023",
//                 end_date: "Present",
//                 description: "العمل على تطوير لوحات تحكم احترافية وتحسين أداء قواعد البيانات."
//             }
//         ],
//         education: [
//             {
//                 degree: "بكالوريوس هندسة حاسبات",
//                 university: "جامعة القاهرة",
//                 year: "2022"
//             }
//         ],
//         projects: [
//             {
//                 name: "AI CV Analyzer",
//                 description: "مشروع يستخدم الذكاء الاصطناعي لتحليل وبناء السير الذاتية.",
//                 link: "http://github.com/sara/cv-project"
//             }
//         ]
//     };

//     // سيقوم بالبحث عن ملف backend/templates/professional_classic.ejs
//     res.render('sidebar_professional', dummyData);
// });
*/
// 6. ربط المسارات (Routes)
const cvRoutes = require('./routes/cvRoutes');
const cvBuilderRoutes = require('./routes/cvBuilderRoutes');
const deptRoutes = require('./routes/deptRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

app.use('/api/cv-builder', cvBuilderRoutes);
app.use('/api/dept', deptRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/interview', interviewRoutes);


app.get('/', (req, res) => {
    res.send('✅ CarearNode Server is Running Perfectly!');
});

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 5001;

sequelize.sync().then(() => {
    console.log('✅ Database Connected & Synced');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔗 Test your CV at: http://localhost:${PORT}/test-my-cv`);
    });
}).catch(err => {
    console.error('❌ Database Connection Error:', err.message);
});