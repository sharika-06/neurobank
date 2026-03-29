const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

// --- OTP Store (Temporary) ---
let tempOtp = {}; // { email: otp_code }

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));

// OTP Endpoints
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempOtp[email] = otp;

    const mailOptions = {
        from: `"Admin Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Admin Security Verification',
        text: `Your admin login OTP is ${otp}.`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #1e1b4b; color: #FFFFFF; border-radius: 10px;">
                <h2 style="color: #6366f1;">Admin Verification</h2>
                <p>Hello Admin,</p>
                <p>Your security verification code is: <strong style="font-size: 24px; color: #6366f1; letter-spacing: 5px;">${otp}</strong></p>
                <p>Use this code to finalize your login to the admin dashboard.</p>
                <hr style="border-top: 1px solid #334155; margin: 20px 0;">
                <p style="font-size: 10px; color: #94a3b8;">Neurograph Admin Portal Security System</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[ADMIN BACKEND] OTP sent to ${email}: ${otp}`);
        res.json({ success: true, message: 'OTP sent' });
    } catch (error) {
        console.error('[ADMIN ERROR] Email failed:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (tempOtp[email] === otp) {
        delete tempOtp[email];
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid OTP' });
    }
});

// Placeholder route
app.get('/', (req, res) => {
    res.send('Admin Portal Backend works!');
});

const server = app.listen(PORT, () => {
    console.log(`[ADMIN] Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[ADMIN ERROR] Port ${PORT} is already in use.`);
    } else {
        console.error('[ADMIN ERROR] Server failed to start:', err);
    }
    process.exit(1);
});
