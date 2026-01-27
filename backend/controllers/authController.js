const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 },
    fileFilter: fileFilter
}).single('profile_image');

// 1. شيلنا إعدادات Multer من هنا خالص (لأنها بقت في Routes)

exports.signup = async (req, res) => {
    // 2. شيلنا دالة upload(req, res) لأن البيانات بتوصل هنا جاهزة خلاص
    try {
        // البيانات النصية موجودة في req.body
        const { full_name, email, password, about_me } = req.body;

        // التحقق من وجود اليوزر
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // تشفير الباسورد
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. استقبال الصورة (لو موجودة) من req.file مباشرة
        // لاحظي: التخزين تم بالفعل في الراوت، هنا بس بناخد الاسم للداتابيز
        const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

        // إنشاء اليوزر
        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            about_me,      // الـ Bio
            profile_image  // رابط الصورة
        });

        res.status(201).json({ 
            message: 'User created successfully', 
            userId: user.id 
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Login successful",
            userId: user.id,
            email: user.email,
            full_name: user.full_name,
            profile_image: user.profile_image, // نبعت الصورة كمان عشان الفرونت يستفيد بيها
            about_me: user.about_me
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ error: error.message });
    }
};