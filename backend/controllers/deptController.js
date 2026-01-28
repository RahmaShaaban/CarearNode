const Department = require('../models/Department');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body; // مصفوفة المواد المختارة من الفرونت إيند
        
        let scores = { CS: 0, IS: 0, IT: 0 };

        selectedCourses.forEach(course => {
            // توزيع المواد بناءً على الصور المرفقة
            if (['Introduction to Programming', 'Data Structures & Algorithms', 'Artificial Intelligence', 'Machine Learning', 'Operating Systems'].includes(course)) scores.CS += 2;
            if (['Software Engineering', 'Database Systems', 'System Analysis & Design', 'E-Commerce', 'Project Management'].includes(course)) scores.IS += 2;
            if (['Computer Networks', 'Network Security', 'Cryptography', 'Linear Algebra', 'Probability & Statistics'].includes(course)) scores.IT += 2;
        });

        const result = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

        res.status(200).json({
            recommendedMajor: result,
            message: `Based on your interest in ${selectedCourses.slice(0, 2).join(' & ')}, we recommend ${result}.`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const depts = await Department.findAll();
        res.status(200).json(depts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};