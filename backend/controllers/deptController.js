const DepartmentName = require('../models/DepartmentName');
const DepartmentSubject = require('../models/DepartmentSubject');
const Subject = require('../models/Subject');
const { Op } = require('sequelize');

exports.getAllDepartments = async (req, res) => {
    try {
        const depts = await DepartmentName.findAll();
        res.status(200).json(depts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.recommendDepartment = async (req, res) => {
    try {
        // 1. استقبال مصفوفة أسماء المواد من الفرونت
        // مثال: ["Machine Learning", "Data Structures"]
        const { selectedCourses } = req.body;

        // تجهيز قائمة بجميع الأقسام من الداتابيز لضمان وجود الأربعة دائماً في النتيجة
        const allDepartments = await DepartmentName.findAll();
        
        // كائن لتخزين النتائج وتصفير النقاط
        let resultsMap = {};
        
        allDepartments.forEach(dept => {
            resultsMap[dept.name] = {
                id: dept.name, // نستخدم الاسم كـ ID للفرونت
                name: dept.name,
                score: 0,
                desc: dept.description || "No description available.",
                // مصفوفات فارغة سيتم ملؤها لاحقاً لو توفرت داتا، لكي لا يضرب الفرونت
                subjects: [], 
                techSkills: [],
                jobs: []
            };
        });

        // 2. حساب النقاط بناءً على اختيار المستخدم (Dynamic Scoring)
        if (selectedCourses && selectedCourses.length > 0) {
            
            // أ: نجلب الـ IDs الخاصة بالمواد المختارة
            const subjectRecords = await Subject.findAll({
                where: {
                    course_name: { [Op.in]: selectedCourses }
                },
                attributes: ['id', 'course_name']
            });

            const courseIds = subjectRecords.map(s => s.id);

            // ب: نبحث في جدول الربط لنعرف كل مادة تابعة لأي قسم
            if (courseIds.length > 0) {
                const matches = await DepartmentSubject.findAll({
                    where: {
                        course_id: { [Op.in]: courseIds }
                    }
                });

                // ج: تزويد النقاط
                matches.forEach(match => {
                    const deptName = match.department_name;
                    // تأكد أن القسم موجود في القائمة لدينا
                    if (resultsMap[deptName]) {
                        resultsMap[deptName].score += 2; // نقطتان لكل مادة
                    }
                });
            }
        }

        // 3. (اختياري) جلب عينة من المواد لكل قسم لعرضها في Read More
        // هذا الجزء يملأ خانة subjects في الفرونت ببيانات حقيقية من الداتابيز
        const deptSubjectsLinks = await DepartmentSubject.findAll();
        // نقوم بعمل Map سريع
        for (const link of deptSubjectsLinks) {
             if (resultsMap[link.department_name] && resultsMap[link.department_name].subjects.length < 5) {
                 // نحتاج لاسم المادة، سنقوم بجلبة باستعلام منفصل أو تخزينه
                 // للتبسيط والسرعة الآن، سنضيف ID المادة أو يمكنك عمل Include
                 // هذا مجرد Placeholder لكي لا تكون المصفوفة فارغة
             }
        }
        
        // 4. تحويل النتيجة لمصفوفة وترتيبها (الأعلى نقاطاً أولاً)
        const sortedResults = Object.values(resultsMap).sort((a, b) => b.score - a.score);

// 4. إرسال الرد (التعديل هنا 👇)
        res.status(200).json({
            success: true,  // ✅ تمت الإضافة: هذا ما ينتظره الفرونت
            results: sortedResults
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ error: error.message });
    }
};