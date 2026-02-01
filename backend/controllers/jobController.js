const Job = require('../models/Job');

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll(); // هات كل الوظائف
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
};