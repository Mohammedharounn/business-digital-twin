const express = require('express');
const {
    signup,
    login,
    logout,
    getMe,
    refresh,
    verifyEmail,
    forgotPassword,
    resetPassword,
    socialLogin,
    verifyOTP,
    resendOTP,
    googleAuth,
    appleAuth
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin, validateOTP } = require('../middleware/validation');

// ─── Public Routes ──────────────────────────────────────────
router.post('/signup', authLimiter, ...validateSignup, signup);
router.post('/login', authLimiter, ...validateLogin, login);
router.post('/verify-otp', authLimiter, ...validateOTP, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);

// OAuth
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/social-login', socialLogin); // Legacy stub

// Token management
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// ─── Private Routes (require JWT) ───────────────────────────
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
