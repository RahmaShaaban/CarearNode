const express = require('express');
const router = express.Router();
const courseController = require('../controllers/subjectController');

// الرابط سيكون: http://localhost:5000/api/courses
router.get('/', courseController.getAllCoursesWithSkills);

module.exports = router;