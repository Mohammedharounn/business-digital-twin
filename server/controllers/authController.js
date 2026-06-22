const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const sendEmail = require('../utils/sendEmail');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const zxcvbn = require('zxcvbn');

// ─── Google OAuth ───────────────────────────────────────────
let OAuth2Client;
try {
    const { OAuth2Client: GClient } = require('google-auth-library');
    OAuth2Client = GClient;
} catch (e) {
    console.warn('[Auth] google-auth-library not installed — Google OAuth disabled');
}

// ─── Helper: Send JWT tokens ────────────────────────────────
const sendTokenResponse = async (user, statusCode, res, deviceId) => {
    const accessToken = user.getSignedJwtToken();
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Limit concurrent sessions (max 5)
    const activeSessions = await RefreshToken.find({ userId: user._id }).sort({ createdAt: 1 });
    if (activeSessions.length >= 5) {
        await RefreshToken.deleteOne({ _id: activeSessions[0]._id });
    }

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        deviceId: deviceId || 'unknown_device',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.status(statusCode)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                role: user.role,
                status: user.status,
                isVerified: user.isVerified,
                avatar: user.avatar,
                provider: user.provider,
                linkedProviders: user.linkedProviders?.map(lp => lp.provider) || []
            }
        });
};

// ─── Helper: Send OTP to user ───────────────────────────────
const sendOTPToUser = async (user, type = 'signup') => {
    // Delete any existing OTPs for this user + type
    await OTP.deleteMany({ userId: user._id, type });

    const code = generateOTP();
    const hashed = hashOTP(code);

    await OTP.create({
        userId: user._id,
        email: user.email,
        code: hashed,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Log OTP to console for development/testing
    console.log(`\n══════════════════════════════════════`);
    console.log(`  OTP for ${user.email}: ${code}`);
    console.log(`  Type: ${type} | Expires: 10 minutes`);
    console.log(`══════════════════════════════════════\n`);

    // Send via email (async, don't block response)
    try {
        await sendEmail({
            email: user.email,
            subject: `Your Verification Code: ${code}`,
            message: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0c15; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="display: inline-block; background: white; color: black; font-weight: 900; font-size: 18px; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; margin-bottom: 16px;">DT</div>
                        <h2 style="color: #fafafa; font-size: 22px; margin: 0;">Verification Code</h2>
                    </div>
                    <div style="text-align: center; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <div style="font-size: 36px; letter-spacing: 12px; font-weight: 800; color: #6366f1; font-family: 'JetBrains Mono', monospace;">${code}</div>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">This code expires in <strong style="color: #fafafa;">10 minutes</strong></p>
                    <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
            `
        });
    } catch (err) {
        console.warn('[OTP] Email send failed (code logged to console):', err.message);
    }

    user._otpCode = code; // Attach to user object for response helper
    return code;
};

// ═══════════════════════════════════════════════════════════
// SIGNUP
// ═══════════════════════════════════════════════════════════
exports.signup = async (req, res, next) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            // If user exists but unverified, resend OTP
            if (existingUser.status === 'unverified' && !existingUser.isVerified) {
                await sendOTPToUser(existingUser, 'signup');
                return res.status(200).json({
                    success: true,
                    requiresOTP: true,
                    email: existingUser.email,
                    message: 'Verification code resent to your email'
                });
            }
            return res.status(400).json({ success: false, error: 'An account with this email already exists' });
        }

        // Check password strength (Relaxed for dev)
        // const score = zxcvbn(password).score;
        // if (score < 2) { ... }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long.'
            });
        }

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            password,
            name: name || email.split('@')[0],
            phone: phone || undefined,
            role: role || 'user',
            provider: 'local',
            status: 'unverified',
            isVerified: false
        });

        await user.save();

        // Send OTP
        await sendOTPToUser(user, 'signup');

        res.status(201).json({
            success: true,
            requiresOTP: true,
            email: user.email,
            code: process.env.NODE_ENV === 'development' ? user._otpCode : undefined, // Dev helper
            message: 'Account created! Please check your email for a verification code.'
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// VERIFY OTP
// ═══════════════════════════════════════════════════════════
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, code, deviceId } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Email and verification code required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ success: false, error: 'No account found with this email' });
        }

        // Find active OTP
        const otpDoc = await OTP.findOne({
            userId: user._id,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({ success: false, error: 'Verification code expired. Please request a new one.' });
        }

        // Check attempts
        if (otpDoc.attempts >= otpDoc.maxAttempts) {
            await OTP.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({ success: false, error: 'Too many attempts. Please request a new code.' });
        }

        // Verify code
        if (!verifyOTP(code, otpDoc.code)) {
            otpDoc.attempts += 1;
            await otpDoc.save();
            const remaining = otpDoc.maxAttempts - otpDoc.attempts;
            return res.status(400).json({
                success: false,
                error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            });
        }

        // OTP valid — activate user
        user.isVerified = true;
        user.status = 'active';
        await user.save({ validateBeforeSave: false });

        // Clean up OTP
        await OTP.deleteMany({ userId: user._id });

        // Send tokens
        await sendTokenResponse(user, 200, res, deviceId || req.body.deviceId);
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// RESEND OTP
// ═══════════════════════════════════════════════════════════
exports.resendOTP = async (req, res, next) => {
    try {
        const { email, type } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Generic response to prevent email enumeration
            return res.status(200).json({ success: true, message: 'If an account exists, a new code was sent.' });
        }

        // Rate limit: max 3 OTPs per 15 minutes
        const recentOTPs = await OTP.countDocuments({
            userId: user._id,
            createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) }
        });

        if (recentOTPs >= 3) {
            return res.status(429).json({
                success: false,
                error: 'Too many code requests. Please wait 15 minutes.'
            });
        }

        await sendOTPToUser(user, type || 'signup');

        res.status(200).json({
            success: true,
            code: process.env.NODE_ENV === 'development' ? user._otpCode : undefined, // Dev helper
            message: 'A new verification code has been sent to your email.'
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
exports.login = async (req, res, next) => {
    try {
        const { email, password, deviceId } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Check if user was created via OAuth only (no local password)
        if (user.provider !== 'local' && !user.password) {
            return res.status(400).json({
                success: false,
                error: `This account uses ${user.provider} sign-in. Please use that method.`
            });
        }

        // Brute force protection
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                error: `Account temporarily locked. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000;
                user.loginAttempts = 0;
            }
            await user.save({ validateBeforeSave: false });
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Reset attempts
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save({ validateBeforeSave: false });

        // If user is unverified, send OTP
        if (!user.isVerified || user.status === 'unverified') {
            await sendOTPToUser(user, 'login');
            return res.status(200).json({
                success: true,
                requiresOTP: true,
                email: user.email,
                code: process.env.NODE_ENV === 'development' ? user._otpCode : undefined, // Dev helper
                message: 'Please verify your email to continue. A code has been sent.'
            });
        }

        await sendTokenResponse(user, 200, res, deviceId);
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ═══════════════════════════════════════════════════════════
exports.googleAuth = async (req, res, next) => {
    try {
        const { credential, deviceId } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, error: 'Google credential token is required' });
        }

        if (!OAuth2Client || !process.env.GOOGLE_CLIENT_ID) {
            return res.status(501).json({
                success: false,
                error: 'Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID in .env'
            });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        let ticket;

        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (verifyErr) {
            return res.status(401).json({ success: false, error: 'Invalid Google token. Please try again.' });
        }

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture, email_verified } = payload;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Google account does not have an email.' });
        }

        // Check if user exists with this email
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Account linking: existing local user → add Google as linked provider
            const alreadyLinked = user.linkedProviders?.some(lp => lp.provider === 'google');
            if (!alreadyLinked) {
                user.linkedProviders = user.linkedProviders || [];
                user.linkedProviders.push({ provider: 'google', providerId: googleId });
            }
            // Update profile picture if not set
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            if (!user.name && name) {
                user.name = name;
            }
            // Auto-verify if Google email is verified
            if (email_verified && !user.isVerified) {
                user.isVerified = true;
                user.status = 'active';
            }
            await user.save({ validateBeforeSave: false });
        } else {
            // Create new user from Google
            user = await User.create({
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                password: crypto.randomBytes(32).toString('hex'),
                provider: 'google',
                providerId: googleId,
                avatar: picture,
                isVerified: email_verified || false,
                status: email_verified ? 'active' : 'unverified',
                linkedProviders: [{ provider: 'google', providerId: googleId }]
            });
        }

        await sendTokenResponse(user, 200, res, deviceId || 'google_oauth');
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// APPLE OAUTH
// ═══════════════════════════════════════════════════════════
exports.appleAuth = async (req, res, next) => {
    try {
        const { identityToken, user: appleUser, deviceId } = req.body;

        if (!identityToken) {
            return res.status(400).json({ success: false, error: 'Apple identity token is required' });
        }

        // Note: Full Apple token verification requires apple-signin-auth library
        // and Apple Developer credentials. For now, we decode the JWT payload.
        const parts = identityToken.split('.');
        if (parts.length !== 3) {
            return res.status(400).json({ success: false, error: 'Invalid Apple token format' });
        }

        let payload;
        try {
            payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Invalid Apple token' });
        }

        const { sub: appleId, email } = payload;
        const name = appleUser?.name
            ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
            : undefined;

        if (!email && !appleId) {
            return res.status(400).json({ success: false, error: 'Could not extract identity from Apple token' });
        }

        // Find user by Apple ID or email
        let user = await User.findOne({
            $or: [
                { providerId: appleId, provider: 'apple' },
                { 'linkedProviders.providerId': appleId },
                ...(email ? [{ email: email.toLowerCase() }] : [])
            ]
        });

        if (user) {
            const alreadyLinked = user.linkedProviders?.some(lp => lp.provider === 'apple');
            if (!alreadyLinked) {
                user.linkedProviders = user.linkedProviders || [];
                user.linkedProviders.push({ provider: 'apple', providerId: appleId });
            }
            if (!user.name && name) user.name = name;
            if (!user.isVerified) {
                user.isVerified = true;
                user.status = 'active';
            }
            await user.save({ validateBeforeSave: false });
        } else {
            user = await User.create({
                email: (email || `apple_${appleId.substring(0, 8)}@private.relay`).toLowerCase(),
                name: name || 'Apple User',
                password: crypto.randomBytes(32).toString('hex'),
                provider: 'apple',
                providerId: appleId,
                isVerified: true,
                status: 'active',
                linkedProviders: [{ provider: 'apple', providerId: appleId }]
            });
        }

        await sendTokenResponse(user, 200, res, deviceId || 'apple_oauth');
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════
exports.logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        res.cookie('refreshToken', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// GET CURRENT USER
// ═══════════════════════════════════════════════════════════
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═══════════════════════════════════════════════════════════
exports.refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Session expired' });
        }

        const refreshTokenDoc = await RefreshToken.findOne({ token }).populate('userId');
        if (!refreshTokenDoc || !refreshTokenDoc.userId) {
            return res.status(401).json({ success: false, error: 'Invalid session' });
        }

        if (['locked', 'suspended'].includes(refreshTokenDoc.userId.status)) {
            return res.status(403).json({ success: false, error: 'Account restricted' });
        }

        await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
        await sendTokenResponse(refreshTokenDoc.userId, 200, res, refreshTokenDoc.deviceId);
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// VERIFY EMAIL (legacy link-based)
// ═══════════════════════════════════════════════════════════
exports.verifyEmail = async (req, res, next) => {
    try {
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Link invalid or expired' });
        }

        user.isVerified = true;
        user.status = 'active';
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });
        const response = { success: true, message: 'If registered, a reset link was sent' };

        if (!user) return res.status(200).json(response);

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/reset-password/${resetToken}`;
        const message = `Password reset request. Click here: \n\n ${resetUrl}`;

        // Fire and forget email (don't block response)
        sendEmail({ email: user.email, subject: 'Password Reset', message })
            .catch(err => {
                console.error('[Forgot Password] Background email failed:', err.message);
                // We don't reset token fields here because response is already sent
            });

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════
exports.resetPassword = async (req, res, next) => {
    try {
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) return res.status(400).json({ success: false, error: 'Reset link invalid or expired' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.passwordChangedAt = Date.now();
        await user.save();

        await sendTokenResponse(user, 200, res, 'password_reset_device');
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════
// SOCIAL LOGIN (legacy stub — kept for compatibility)
// ═══════════════════════════════════════════════════════════
exports.socialLogin = async (req, res, next) => {
    try {
        const { provider, email, deviceId } = req.body;
        const socialEmail = email || `${provider}_user_${crypto.randomBytes(4).toString('hex')}@mock.dt.com`;

        let user = await User.findOne({ email: socialEmail.toLowerCase() });
        if (!user) {
            user = await User.create({
                email: socialEmail.toLowerCase(),
                password: crypto.randomBytes(32).toString('hex'),
                name: socialEmail.split('@')[0],
                role: 'user',
                provider: provider || 'local',
                status: 'active',
                isVerified: true
            });
        }

        await sendTokenResponse(user, 200, res, deviceId || `social_${provider}`);
    } catch (err) {
        next(err);
    }
};
