const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

// الروابط الأساسية (عرض الرودماب)
router.get('/', roadmapController.getAllRoadmaps);
router.get('/:id', roadmapController.getRoadmapData);

// >>> الروابط الجديدة (الاشتراك والتقدم) <<<
// 1. رابط زرار Start
router.post('/enroll', roadmapController.enrollRoadmap); 

// 2. رابط التأكد من الحالة (عشان الفرونت يعرف يلون الزرار)
router.get('/status/:roadmapId/:userId', roadmapController.getUserRoadmapStatus); 

// 3. رابط الـ Checkbox (تحديث البروجرس)
router.put('/progress', roadmapController.updateProgress); 

router.delete('/enroll', roadmapController.unenrollRoadmap);

module.exports = router;