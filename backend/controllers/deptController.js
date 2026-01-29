const Department = require('../models/Department');

exports.recommendDepartment = async (req, res) => {
    try {
        const { selectedCourses } = req.body;

        // 1. ????? ????????
        let scores = {
            "Computer Science (CS)": 0,
            "Information Systems (IS)": 0,
            "Scientific Computing (SC)": 0,
            "Computer Systems": 0
        };

        // 2. ???? ??????
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

        // 3. ????? ????? ??? ??? (???? ???? ?? ???????)
        const descriptions = {
            "Computer Science (CS)": "Focuses on algorithms, software design, and AI. Best for problem solvers.",
            "Information Systems (IS)": "Bridges business and technology. Great for analytics and management.",
            "Scientific Computing (SC)": "Deals with simulation, modeling, and advanced math applications.",
            "Computer Systems": "Focuses on hardware-software integration, robotics, and architecture."
        };

        // 4. ????? ??????? ?????? ????? (Array)
        const sortedResults = Object.keys(scores).map(key => ({
            name: key,
            score: scores[key],
            desc: descriptions[key]
        })).sort((a, b) => b.score - a.score); // ??????? ?? ?????? ??????

        // 5. ????? ??????? ?????
        res.status(200).json({ results: sortedResults });

    } catch (error) {
        console.error(error);
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