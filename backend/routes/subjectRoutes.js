const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// ⚠️ تأكدي أن هذه الكلمة (getAllSubjects) تطابق الموجودة في الكنترولر
router.get('/', subjectController.getAllSubjects);

module.exports = router;