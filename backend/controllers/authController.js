const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- 1. Signup ---
exports.signup = async (req, res) => {
    try {
        const { full_name, email, password, about_me } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            about_me,
            profile_image
            // department_name سيظل NULL حتى يتم ترشيحه من الـ Checklist
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
            email: user.email,
            full_name: user.full_name
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
            department_name: user.department_name
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
        const { full_name, email, role, bio, department_name } = req.body;

        const newProfileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تحديث البيانات والتأكد من الحفظ الفعلي
        user.full_name = full_name || user.full_name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.about_me = bio || user.about_me;
        
        if (department_name) {
            user.department_name = department_name;
        }

        if (newProfileImage) {
            user.profile_image = newProfileImage;
        }

        await user.save(); // الحفظ النهائي في Supabase

        res.status(200).json({
            message: "Profile updated in Supabase successfully",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                department_name: user.department_name,
                profile_image: user.profile_image
            }
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};