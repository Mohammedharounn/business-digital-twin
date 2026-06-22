const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    code: {
        type: String,
        required: true // Stored as SHA-256 hash
    },
    type: {
        type: String,
        enum: ['signup', 'login', 'password_reset'],
        default: 'signup'
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL — auto-delete when expired
    }
}, { timestamps: true });

// Prevent multiple active OTPs for same user + type
OTPSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('OTP', OTPSchema);
