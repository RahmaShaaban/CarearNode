const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/cvs/');
    },
    filename: (req, file, cb) => {
        cb(null, `cv-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('cvFile'), cvController.processCV);

module.exports = router;

