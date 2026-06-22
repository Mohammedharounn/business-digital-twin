const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        sparse: true,
        match: [/^\+?[1-9]\d{6,14}$/, 'Please add a valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'investor'],
        default: 'user'
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'apple'],
        default: 'local'
    },
    providerId: String,
    avatar: String,
    linkedProviders: [{
        provider: { type: String, enum: ['google', 'apple'] },
        providerId: String,
        linkedAt: { type: Date, default: Date.now }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'locked', 'suspended', 'unverified'],
        default: 'unverified'
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationTokenExpire: Date,
    activeProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    }
}, { timestamps: true });

// PASSWORD HASHING HOOK
// Modern Mongoose pattern: async function without 'next'
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
});

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

UserSchema.methods.getVerificationToken = function () {
    const rawToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    return rawToken;
};

module.exports = mongoose.model('User', UserSchema);
