const Department = require('../models/Department');
const departments_name = require('../models/DepartmentName');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;
        
        let scores = {
            "Computer Science (CS)": 0,
            "Information Systems (IS)": 0, 
            "Scientific Computing (SC)": 0,
            "Computer Systems": 0
        };

        if (selectedCourses && selectedCourses.length > 0) {
            selectedCourses.forEach(course => {
                if (['Compiler Theory', 'Artificial Intelligence', 'Machine Learning'].includes(course))
                    scores["Computer Science (CS)"] += 2;
                if (['Data Mining', 'Business Intelligence', 'E-Commerce'].includes(course))
                    scores["Information Systems (IS)"] += 2;
                if (['Computer Vision', 'Game Design', 'Digital Signal Processing'].includes(course))
                    scores["Scientific Computing (SC)"] += 2;
                if (['Embedded Systems', 'Robotics & Control', 'Computer Architecture'].includes(course))
                    scores["Computer Systems"] += 2;
            });
        }

        const descriptions = {
            "Computer Science (CS)": "Focuses on the theoretical foundations of computation and programming. This department prepares students to develop complex algorithms, build intelligent systems through Artificial Intelligence and Machine Learning, and master software engineering principles.",
            "Information Systems (IS)": "Bridges the gap between technology and business management. Students learn to analyze big data, manage complex database systems, and develop technical solutions like Data Mining and E-Commerce to support organizational decision-making.",
            "Scientific Computing (SC)": "A specialized technical path focusing on mathematical modeling and computer simulations to solve complex scientific problems. It emphasizes areas like Computer Vision, Digital Signal Processing, and high-performance computing.",
            "Computer Systems": "Centers on the interaction between software and hardware. Students explore Embedded Systems, Robotics, and Computer Architecture, learning how to design and control the physical machines that power our world."
        };


        const sortedResults = Object.keys(scores).map(key => ({
            name: key,
            score: scores[key],
            desc: descriptions[key]
        })).sort((a, b) => b.score - a.score);

        res.status(200).json({ results: sortedResults });
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