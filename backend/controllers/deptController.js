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

        // تعديل أوبجيكت الـ descriptions في الباكاند
        const descriptions = {
            "Computer Science (CS)": {
                desc: "Focuses on the theoretical foundations of computation and programming...",
                subjects: ["Compiler Theory", "Artificial Intelligence", "Machine Learning", "Algorithms", "Theory of Computation"],
                skills: ["Problem Solving", "Algorithm Design", "C++/Java", "AI/ML Development"],
                jobs: ["Software Engineer", "AI Developer", "System Architect"]
            },
            "Information Systems (IS)": {
                desc: "Bridges the gap between technology and business management...",
                subjects: ["Database Management", "System Analysis", "E-Commerce", "Data Mining", "Enterprise Systems"],
                skills: ["Business Analysis", "Database Design", "SQL", "Project Management"],
                jobs: ["Business Analyst", "Database Administrator", "ERP Specialist"]
            },
            "Scientific Computing (SC)": {
                desc: "A specialized technical path focusing on mathematical modeling...",
                subjects: ["Numerical Analysis", "Simulation", "Computer Vision", "Signal Processing"],
                skills: ["Mathematical Modeling", "MATLAB/Python", "Data Visualization", "Parallel Computing"],
                jobs: ["Data Scientist", "Simulation Engineer", "Research Scientist"]
            },
            "Computer Systems": {
                desc: "Centers on the interaction between software and hardware...",
                subjects: ["Embedded Systems", "Robotics", "Computer Architecture", "Real-time Systems"],
                skills: ["Hardware Interfacing", "C/Assembly", "Microcontrollers", "Control Systems"],
                jobs: ["Embedded Systems Engineer", "Robotics Engineer", "Hardware Developer"]
            }
        };

        
        const sortedResults = Object.keys(scores).map(key => ({
            name: key,
            score: scores[key],
            desc: descriptions[key].desc,
            subjects: descriptions[key].subjects, 
            techSkills: descriptions[key].skills,  
            jobs: descriptions[key].jobs          
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