//emailService.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nemma3172004@gmail.com'
, 
        pass: 'aivlntsetfcmxyhf'  // الـ 16 حرف
    }
});

const sendInterviewReport = async (userEmail, reportContent) => {
    try {
        const mailOptions = {
            from: '"Career AI Guide" <your-email@gmail.com>',
            to: userEmail, 
            subject: 'نتائج تقييم المقابلة الشخصية',
            html: `
                <div style="direction: rtl; font-family: sans-serif; padding: 20px;">
                    <h2>تقرير أداء المقابلة</h2>
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 10px; background-color: #f9f9f9;">
                        ${reportContent}
                    </div>
                </div>`
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', userEmail);
    } catch (error) {
        console.error('Email error:', error);
    }
};

module.exports = { sendInterviewReport };


//****************************