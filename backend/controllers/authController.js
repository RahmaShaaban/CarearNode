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

exports.signup = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        try {
            const { full_name, email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

            const user = await User.create({
                full_name,
                email,
                password: hashedPassword,
                profile_image
            });

            res.status(201).json({ 
                message: 'User created successfully', 
                userId: user.id,
                imageUrl: profile_image 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.full_name,
                image: user.profile_image 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};