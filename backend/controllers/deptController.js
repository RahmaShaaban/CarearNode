const Department = require('../models/Department');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;

        // 1. تجهيز العدادات لكل قسم (بالاسم والوصف عشان الفرونت يعرضهم)
        let scores = {
            "CS": {
                id: "CS",
                name: "Computer Science",
                score: 0,
                desc: "Focuses on algorithms, programming, and software architecture."
            },
            "IS": {
                id: "IS",
                name: "Information Systems",
                score: 0,
                desc: "Focuses on databases, system analysis, and business solutions."
            },
            "IT": {
                id: "IT",
                name: "Information Technology",
                score: 0,
                desc: "Focuses on networks, security, and infrastructure."
            },
            "AI": { // ضفتلك ده عشان طلبتي 4 أقسام
                id: "AI",
                name: "AI & Data Science",
                score: 0,
                desc: "Focuses on machine learning, data analysis, and intelligent systems."
            }
        };

        // 2. توزيع النقاط (نفس المواد اللي عندك بالظبط)
        if (selectedCourses && selectedCourses.length > 0) {
            selectedCourses.forEach(course => {
                // CS Group
                if (['Introduction to Programming', 'Data Structures & Algorithms', 'Operating Systems', 'Linear Algebra'].includes(course)) {
                    scores.CS.score += 2;
                }
                // AI Group
                if (['Artificial Intelligence', 'Machine Learning', 'Probability & Statistics'].includes(course)) {
                    scores.AI.score += 2;
                }
                // IS Group
                if (['Software Engineering', 'Database Systems', 'System Analysis & Design', 'E-Commerce', 'Project Management'].includes(course)) {
                    scores.IS.score += 2;
                }
                // IT Group
                if (['Computer Networks', 'Network Security', 'Cryptography', 'Web Development'].includes(course)) {
                    scores.IT.score += 2;
                }
            });
        }

        // 3. تحويل النتيجة لمصفوفة وترتيبها (من الكبير للصغير)
        // ده السطر السحري اللي كان ناقصك
        const sortedResults = Object.values(scores).sort((a, b) => b.score - a.score);

        // 4. إرسال القائمة كاملة للفرونت
        res.status(200).json({
            results: sortedResults
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// الدالة التانية زي ما هي
exports.getAllDepartments = async (req, res) => {
    try {
        const depts = await Department.findAll();
        res.status(200).json(depts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};







