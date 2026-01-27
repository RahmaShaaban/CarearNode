const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// إعدادات تخزين الصور (Multer Config)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // بنسمي الملف باسم مميز باستخدام التاريخ
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// راوت الـ Signup مع دعم رفع صورة واحدة
router.post('/signup', upload.single('profileImage'), authController.signup);

router.post('/login', authController.login);
router.get('/profile/:id', authController.getUserProfile);

// راوت تحديث البروفايل مع دعم رفع الصورة
router.put('/profile/:id', upload.single('profileImage'), authController.updateProfile);

module.exports = router;