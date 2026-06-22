const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP code for secure storage
 */
const hashOTP = (code) => {
    return crypto.createHash('sha256').update(String(code)).digest('hex');
};

/**
 * Verify a plain OTP against its hash
 */
const verifyOTP = (code, hash) => {
    return hashOTP(code) === hash;
};

module.exports = { generateOTP, hashOTP, verifyOTP };
