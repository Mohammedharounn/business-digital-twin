const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors from express-validator
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(e => e.msg);
        return res.status(400).json({
            success: false,
            error: messages[0], // Return first error for clean UX
            errors: messages
        });
    }
    next();
};

/**
 * Validate signup input
 */
const validateSignup = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('phone')
        .optional()
        .matches(/^\+?[1-9]\d{6,14}$/).withMessage('Please provide a valid phone number'),
    handleValidation
];

/**
 * Validate login input
 */
const validateLogin = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidation
];

/**
 * Validate OTP input
 */
const validateOTP = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('code')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
        .isNumeric().withMessage('OTP must be numeric'),
    handleValidation
];

module.exports = { validateSignup, validateLogin, validateOTP };
