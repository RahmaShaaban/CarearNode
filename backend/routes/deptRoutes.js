const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');

// هذا الرابط يجلب أسماء الأقسام فقط (لو الفرونت بيحتاجها في القائمة)
router.get('/', deptController.getAllDepartments);

// هذا الرابط المسؤول عن التوصية وحساب النقاط
router.post('/recommend', deptController.recommendDepartment);

module.exports = router;