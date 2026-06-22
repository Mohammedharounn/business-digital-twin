const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Temporarily increased for development
    message: {
        success: false,
        error: 'Too many attempts from this IP, please try again after 15 minutes'
    }
});

exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: {
        success: false,
        error: 'Too many requests, please slow down'
    }
});
