const sequelize = require('../config/database'); 
// تأكدي أن هذا السطر بدون أقواس {} حول المتغير كما اتفقنا سابقاً

exports.getAllDepartments = async (req, res) => {
    try {
        const [results] = await sequelize.query("SELECT * FROM departments_name");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching depts:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;
        console.log("🚀 Starting Recommendation for:", selectedCourses);

        // 1. جلب كل الأقسام
        const [departments] = await sequelize.query("SELECT * FROM departments_name");
        
        if (!departments || departments.length === 0) {
            console.error("❌ No departments found in DB!");
            return res.status(500).json({ success: false, message: "Database empty" });
        }

        let resultsMap = {};

        // 2. تجهيز البيانات لكل قسم
        for (const dept of departments) {
            
            // أ. جلب الوظائف
            const [jobs] = await sequelize.query(`
                SELECT j.title 
                FROM jobs j
                JOIN job_departments jd ON j.id = jd.job_id
                WHERE jd.department_name = '${dept.name}'
            `);

            // ب. جلب المهارات (تم التصحيح هنا ✅)
            // نختار skill_name ونسميه name عشان الفرونت إند يفهمه
            const [skills] = await sequelize.query(`
                SELECT t.skill_name as name 
                FROM tech_skills t
                JOIN skills_for_department sd ON t.id = sd.skill_id
                WHERE sd.department_name = '${dept.name}'
            `);

            resultsMap[dept.name] = {
                id: dept.name,
                name: dept.name,
                score: 0,
                desc: dept.description,
                subjects: [],
                jobs: jobs.map(j => j.title),
                techSkills: skills.map(s => s.name) // هنا سيقرأ 'name' الذي هو الاسم المستعار لـ skill_name
            };
        }

        // 3. حساب النقاط
        if (selectedCourses && selectedCourses.length > 0) {
            // تنظيف أسماء المواد
            const coursesList = selectedCourses.map(c => `'${c.replace(/'/g, "''")}'`).join(", ");
            
            const [matches] = await sequelize.query(`
                SELECT department_name, course_name 
                FROM department_subjects 
                WHERE course_name IN (${coursesList})
            `);

            console.log(`✅ Found ${matches.length} matches in department_subjects`);

            matches.forEach(match => {
                const deptName = match.department_name;
                if (resultsMap[deptName]) {
                    resultsMap[deptName].score += 2;
                    if (!resultsMap[deptName].subjects.includes(match.course_name)) {
                        resultsMap[deptName].subjects.push(match.course_name);
                    }
                }
            });
        }

        // 4. الترتيب
        const sortedResults = Object.values(resultsMap).sort((a, b) => b.score - a.score);

        console.log("🏆 Top Recommendation:", sortedResults[0]?.name);

        res.status(200).json({
            success: true,
            results: sortedResults
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR in recommendDepartment:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack 
        });
    }
};