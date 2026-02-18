const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

// 1. مسار طلب الكويز (GET)
// بنبعت رقم الـ Step في الرابط
router.get('/step/:stepId/quiz', roadmapController.generateStepQuiz);

// 2. مسار تسليم الإجابات (POST)
// بنبعت البيانات في الـ Body
router.post('/step/quiz/submit', roadmapController.submitStepQuiz);


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