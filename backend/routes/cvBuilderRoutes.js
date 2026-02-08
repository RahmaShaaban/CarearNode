const express = require('express');
const router = express.Router();
// 1. تأكدي إن المسار ده صح وبيشاور على الملف اللي فيه الدالة
const cvBuilderController = require('../controllers/cvBuilderController');

// 2. لو الدالة اسمها saveCVData في الكنترولر، لازم تكون هنا نفس الاسم
// الإيرور بيقول إن السطر ده (سطر 6) فيه مشكلة لأن cvBuilderController.saveCVData بـ undefined
router.get('/templates', cvBuilderController.getTemplates);
router.get('/preview/:id', cvBuilderController.previewCV);
router.get('/download/:id', cvBuilderController.downloadCVAsPDF);
router.post('/save', cvBuilderController.createCVFromScratch); 
module.exports = router;