const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');

router.get('/all', deptController.getAllDepartments);
router.post('/recommend', deptController.recommendDepartment);

module.exports = router;