// emailService.js
const nodemailer = require('nodemailer');
const html_to_pdf = require('html-pdf-node'); // استدعاء مكتبة الـ PDF

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nemma3172004@gmail.com', 
        pass: 'aivlntsetfcmxyhf'  
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendInterviewReport = async (userEmail, interviewId, finalScore, reportHtml) => {
    try {
        // 1️⃣ إعدادات تحويل الـ HTML إلى PDF
        let options = { 
            format: 'A4', 
            printBackground: true, 
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } 
        };
        let file = { content: reportHtml }; // بنديله הـ HTML الكامل اللي اتبنى في الكنترولر

        console.log('📄 Generating PDF Report...');
        // إنشاء ملف الـ PDF وحفظه في الذاكرة كـ Buffer
        const pdfBuffer = await html_to_pdf.generatePdf(file, options);

        // 2️⃣ رسالة الإيميل "الحلوة" (اللي هتظهر لليوزر لما يفتح الإيميل)
        const emailBody = `
            <div style="direction: ltr; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 30px; background-color: #F0F7F5; border-radius: 16px; text-align: center; max-width: 600px; margin: 0 auto; border: 1px solid #dbece8;">
                <h2 style="color: #2F5D54; font-size: 24px; margin-bottom: 10px;">Hello Future Developer! 🚀</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Great job completing your AI mock interview! We've successfully analyzed your performance.<br><br>
                    Your overall score is: <strong style="font-size: 22px; color: #58A492;">${finalScore}%</strong>
                </p>
                
                <div style="background-color: #ffffff; border-left: 4px solid #58A492; padding: 15px; margin-bottom: 25px; text-align: left;">
                    <p style="color: #475569; font-size: 15px; margin: 0;">
                        📄 We've attached a detailed, comprehensive <strong>PDF Report</strong> covering your technical knowledge, body language, and speech analytics. Make sure to download it!
                    </p>
                </div>

                
                <p style="margin-top: 40px; color: #94a3b8; font-size: 13px; border-top: 1px solid #cbd5e1; padding-top: 20px;">
                    Best of luck on your career journey!<br>
                    <strong style="color: #2F5D54;">Career AI Guide Team</strong>
                </p>
            </div>
        `;

        // 3️⃣ إعدادات الإرسال (دمج الرسالة مع ملف الـ PDF)
        const mailOptions = {
            from: '"Career AI Guide" <nemma3172004@gmail.com>',
            to: userEmail, 
            subject: '🚀 Your Comprehensive Interview Report is Here!',
            html: emailBody, // الرسالة
            attachments: [
                {
                    filename: 'Career_AI_Interview_Report.pdf', // اسم الملف اللي هيظهر لليوزر
                    content: pdfBuffer, // ملف الـ PDF نفسه
                    contentType: 'application/pdf'
                }
            ]
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Email with PDF attached sent successfully to:', userEmail);
    } catch (error) {
        console.error('❌ Email error:', error);
    }
};

module.exports = { sendInterviewReport };