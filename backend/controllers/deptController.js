const sequelize = require('../config/database'); 

exports.getAllDepartments = async (req, res) => {
    try {
        const [results] = await sequelize.query("SELECT * FROM departments_name");
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;
        console.log("🚀 Starting Recommendation for:", selectedCourses);

        const [departments] = await sequelize.query("SELECT * FROM departments_name");
        
        if (!departments || departments.length === 0) {
            return res.status(500).json({ success: false, message: "Database empty" });
        }

        let resultsMap = {};

        for (const dept of departments) {
            // جلب الوظائف
            const [jobs] = await sequelize.query(`
                SELECT j.title FROM jobs j
                JOIN job_departments jd ON j.id = jd.job_id
                WHERE jd.department_name = '${dept.name}'
            `);

            // جلب المهارات
            const [skills] = await sequelize.query(`
                SELECT t.skill_name as name FROM tech_skills t
                JOIN skills_for_department sd ON t.id = sd.skill_id
                WHERE sd.department_name = '${dept.name}'
            `);

            // جلب كل مواد القسم
            const [allSubjects] = await sequelize.query(`
                SELECT course_name FROM department_subjects 
                WHERE department_name = '${dept.name}'
            `);

            resultsMap[dept.name] = {
                id: dept.name,
                name: dept.name,
                score: 0,
                desc: dept.description,
                allSubjects: allSubjects.map(s => s.course_name),
                matchedSubjects: [], // تأكدي إن الاسم ده هو اللي بنستخدمه تحت ✅
                jobs: jobs.map(j => j.title),
                techSkills: skills.map(s => s.name)
            };
        }

        if (selectedCourses && selectedCourses.length > 0) {
            const coursesList = selectedCourses.map(c => `'${c.replace(/'/g, "''")}'`).join(", ");
            
            const [matches] = await sequelize.query(`
                SELECT department_name, course_name 
                FROM department_subjects 
                WHERE course_name IN (${coursesList})
            `);

            console.log(`✅ Found ${matches.length} matches`);

            matches.forEach(match => {
                const deptName = match.department_name;
                // التأكد إن القسم موجود في الـ Map وإن الـ matchedSubjects معرفة
                if (resultsMap[deptName]) {
                    resultsMap[deptName].score += 2;
                    
                    // التصحيح هنا: التأكد من وجود المصفوفة قبل عمل includes ✅
                    if (resultsMap[deptName].matchedSubjects && !resultsMap[deptName].matchedSubjects.includes(match.course_name)) {
                        resultsMap[deptName].matchedSubjects.push(match.course_name);
                    }
                }
            });
        }

        const sortedResults = Object.values(resultsMap).sort((a, b) => b.score - a.score);

        res.status(200).json({
            success: true,
            results: sortedResults
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};