const express = require('express');
const router = express.Router();
const cvBuilderController = require('../controllers/cvBuilderController');

router.get('/templates', cvBuilderController.getTemplates);
router.get('/preview/:id', cvBuilderController.previewCV);
router.get('/download/:id', cvBuilderController.downloadCVAsPDF);
router.post('/save', cvBuilderController.createCVFromScratch);

// 🆕 الروت الجديد للحفظ اليدوي في سطر 11
router.post('/save-to-profile', cvBuilderController.saveCVToProfile);

module.exports = router;