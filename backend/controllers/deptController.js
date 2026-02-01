const Department = require('../models/Department');
const departments_name = require('../models/DepartmentName');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;

        // 1. تعريف الأقسام مع التفاصيل الكاملة (عشان صفحة التفاصيل الجديدة تشتغل)
        let departmentsData = {
            "CS": {
                id: "CS",
                name: "Computer Science",
                score: 0,
                desc: "Focuses on algorithms, programming, software architecture, and solving complex problems.",
                // التفاصيل الإضافية عشان صفحة Read More
                subjects: ["Algorithms", "Data Structures", "Operating Systems", "Compiler Theory"],
                techSkills: ["Problem Solving", "C++ / Java", "Software Architecture", "Logic Design"],
                jobs: ["Software Engineer", "Backend Developer", "Algorithm Engineer"]
            },
            "IS": {
                id: "IS",
                name: "Information Systems",
                score: 0,
                desc: "Focuses on databases, system analysis, business solutions, and managing enterprise systems.",
                subjects: ["Database Systems", "System Analysis", "E-Commerce", "Enterprise ERP"],
                techSkills: ["SQL / NoSQL", "Business Analysis", "Project Management", "Data Modeling"],
                jobs: ["Business Analyst", "Database Administrator", "Product Manager"]
            },
            "IT": {
                id: "IT",
                name: "Information Technology",
                score: 0,
                desc: "Focuses on networks, security, infrastructure, and keeping systems running smoothly.",
                subjects: ["Computer Networks", "Network Security", "Cloud Computing", "System Administration"],
                techSkills: ["Networking (TCP/IP)", "Cybersecurity", "Linux Administration", "Cloud (AWS/Azure)"],
                jobs: ["Network Engineer", "Security Analyst", "DevOps Engineer"]
            },
            "AI": {
                id: "AI",
                name: "AI & Data Science",
                score: 0,
                desc: "Focuses on machine learning, data analysis, intelligent systems, and robotics.",
                subjects: ["Machine Learning", "Deep Learning", "Data Mining", "Statistics"],
                techSkills: ["Python (Pandas/PyTorch)", "Data Analysis", "Model Training", "Mathematics"],
                jobs: ["Data Scientist", "AI Engineer", "Machine Learning Researcher"]
            }
        };

        // 2. توزيع النقاط (بناءً على المواد اللي انتي مختاراها في الفرونت)
        if (selectedCourses && selectedCourses.length > 0) {
            selectedCourses.forEach(course => {
                // CS Group
                if (['Introduction to Programming', 'Data Structures & Algorithms', 'Operating Systems', 'Linear Algebra'].includes(course)) {
                    departmentsData.CS.score += 2;
                }
                // AI Group
                if (['Artificial Intelligence', 'Machine Learning', 'Probability & Statistics'].includes(course)) {
                    departmentsData.AI.score += 2;
                }
                // IS Group
                if (['Software Engineering', 'Database Systems', 'System Analysis & Design', 'E-Commerce', 'Project Management'].includes(course)) {
                    departmentsData.IS.score += 2;
                }
                // IT Group
                if (['Computer Networks', 'Network Security', 'Cryptography', 'Web Development'].includes(course)) {
                    departmentsData.IT.score += 2;
                }
            });
        }

        // 3. تحويل النتيجة لمصفوفة وترتيبها
        const sortedResults = Object.values(departmentsData).sort((a, b) => b.score - a.score);

        // 4. إرسال الرد
        res.status(200).json({
            results: sortedResults
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const depts = await departments_name.findAll();
        res.status(200).json(depts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};