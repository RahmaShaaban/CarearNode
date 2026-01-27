const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- 1. Signup ---
exports.signup = async (req, res) => {
    try {
        const { full_name, email, password, about_me } = req.body;

        // التحقق من وجود اليوزر مسبقاً
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // استقبال مسار الصورة من req.file (الذي تم معالجته في الـ Route)
        const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

        // إنشاء المستخدم الجديد في قاعدة البيانات
        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            about_me,
            profile_image
        });

        // إرجاع بيانات اليوزر كاملة للفرونت إند
        res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            profile_image: user.profile_image
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- 2. Login ---
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
            profile_image: user.profile_image,
            about_me: user.about_me,
            role: user.role
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- 3. Get User Profile ---
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

// --- 4. Update Profile ---
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { full_name, email, role, bio } = req.body;

        // التحقق من وجود ملف صورة جديد
        const newProfileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تحديث البيانات النصية
        user.full_name = full_name || user.full_name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.about_me = bio || user.about_me;

        // تحديث الصورة فقط إذا تم رفع ملف جديد
        if (newProfileImage) {
            user.profile_image = newProfileImage;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                about_me: user.about_me,
                profile_image: user.profile_image
            }
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};