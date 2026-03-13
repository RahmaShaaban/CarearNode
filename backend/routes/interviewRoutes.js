const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

// إعداد تخزين مؤقت للفيديو اللي جاي من الفرونت إند
const upload = multer({ storage: multer.memoryStorage() });

// ده الراوت اللي الـ React هيكلمه
router.post('/analyze', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "لم يتم استقبال أي فيديو" });
        }

        // تجهيز الفيديو عشان نبعته لسيرفر الـ AI
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        console.log("Sending video to AI Server...");

        // الاتصال بسيرفر البايثون (بورت 5000 اللي شغلناه)
        const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // إرسال نتيجة التحليل للـ React
        res.json(response.data);

    } catch (error) {
        console.error("Error communicating with AI server:", error.message);
        res.status(500).json({ error: "فشل الاتصال بمحرك الذكاء الاصطناعي" });
    }
    
});
// راوت توليد الأسئلة - ده اللي ناقص عشان الزرار يشتغل
router.get('/questions', async (req, res) => {
    try {
        // ممكن نبعت الطلب لسيرفر الـ AI عشان يولد أسئلة ذكية
        // أو حالياً نبعت أسئلة ثابتة عشان نتأكد إن الكوبري شغال
        const response = await axios.get('http://127.0.0.1:5000/questions'); 
        res.json(response.data);
    } catch (error) {
        console.error("AI Server (Questions) Error:", error.message);
        // لو سيرفر الـ AI لسه مجهزناش فيه راوت الأسئلة، نبعت أسئلة مؤقتة
        res.json([
            "Tell us about yourself?",
            "What are your strengths and weaknesses?",
            "Why do you want to join our company?"
        ]);
    }
});

module.exports = router;