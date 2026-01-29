const Department = require('../models/Department');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;
        let scores = { 
            "Computer Science (CS)": 0, 
            "Information Systems (IS)": 0, 
            "Scientific Computing (SC)": 0,
            "Computer Systems": 0 
        };

        selectedCourses.forEach(course => {
            if (['Compiler Theory', 'Artificial Intelligence', 'Machine Learning'].includes(course)) scores["Computer Science (CS)"] += 2;
            if (['Data Mining', 'Business Intelligence', 'E-Commerce'].includes(course)) scores["Information Systems (IS)"] += 2;
            if (['Computer Vision', 'Game Design', 'Digital Signal Processing'].includes(course)) scores["Scientific Computing (SC)"] += 2;
            if (['Embedded Systems', 'Robotics & Control', 'Computer Architecture'].includes(course)) scores["Computer Systems"] += 2;
        });

        const result = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

        res.status(200).json({ recommendedMajor: result });
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