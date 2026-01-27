const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// 1. إعدادات تخزين الصور (Multer Config)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // المكان اللي هنحفظ فيه
    },
    filename: (req, file, cb) => {
        // بنسمي الملف باسم مميز (عشان لو صورتين بنفس الاسم ميدخلوش في بعض)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. تحديث راوت الـ Signup (زودنا upload.single)
// 'profileImage' ده الاسم اللي لازم نستخدمه في الفرونت إند
router.post('/signup', upload.single('profileImage'), authController.signup);

router.post('/login', authController.login);
router.get('/profile/:id', authController.getUserProfile);

module.exports = router;