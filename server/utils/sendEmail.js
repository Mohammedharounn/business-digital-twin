const nodemailer = require('nodemailer');

let transporter;

const sendEmail = async (options) => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 5000, // 5s timeout
            greetingTimeout: 5000,
            socketTimeout: 5000,
        });
    }

    const message = {
        from: `${process.env.EMAIL_FROM_NAME || 'Business Digital Twin'} <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Add HTML version if provided
    if (options.html) {
        message.html = options.html;
    }

    try {
        const info = await transporter.sendMail(message);
        console.log('[Email] Sent to %s — ID: %s', options.email, info.messageId);
        return info;
    } catch (err) {
        console.warn('[Email] Failed to send to %s: %s', options.email, err.message);
        throw err;
    }
};

module.exports = sendEmail;
