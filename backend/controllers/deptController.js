const DepartmentName = require('../models/DepartmentName');
const DepartmentSubject = require('../models/DepartmentSubject');
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
        // نستقبل أسماء المواد من الفرونت (مثلاً: ["Machine Learning", "Software Engineering"])
        const { selectedCourses } = req.body;

        const allDepartments = await DepartmentName.findAll();
        let resultsMap = {};

        // 1. تجهيز العدادات
        allDepartments.forEach(dept => {
            resultsMap[dept.name] = {
                id: dept.name,
                name: dept.name,
                score: 0,
                desc: dept.description || "Description unavailable",
                subjects: [],
                techSkills: [],
                jobs: []
            };
        });

        // 2. حساب النقاط (التعديل الجديد: البحث بالاسم مباشرة)
        if (selectedCourses && selectedCourses.length > 0) {
            
            // 🔥 هنا التغيير: لم نعد بحاجة للبحث عن ID المادة أولاً
            // نبحث في جدول الربط مباشرة باستخدام "اسم الكورس"
            const matches = await DepartmentSubject.findAll({
                where: {
                    course_name: { [Op.in]: selectedCourses } // ✅ البحث بالاسم
                }
            });

            // تزويد النقاط
            matches.forEach(match => {
                const deptName = match.department_name;
                // تأكد أن القسم موجود في القائمة لدينا
                if (resultsMap[deptName]) {
                    resultsMap[deptName].score += 2; 

                    // (إضافة جمالية) تخزين المواد التي ساهمت في الفوز لعرضها لاحقاً
                    if (!resultsMap[deptName].subjects.includes(match.course_name)) {
                        resultsMap[deptName].subjects.push(match.course_name);
                    }
                }
            });
        }

        // 3. الترتيب
        const sortedResults = Object.values(resultsMap).sort((a, b) => b.score - a.score);

        // 4. إرسال الرد
        res.status(200).json({
            success: true, 
            results: sortedResults
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};