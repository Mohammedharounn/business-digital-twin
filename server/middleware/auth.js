const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Verify JWT token from header or cookie
 */
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Please log in to access this resource' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, error: 'User account no longer exists' });
        }

        // Security: Block inactive or restricted accounts
        if (['locked', 'suspended'].includes(user.status)) {
            return res.status(403).json({ success: false, error: 'Your account has been restricted. Contact support.' });
        }

        // Optional: Block unverified users from private routes
        // if (user.status === 'unverified') {
        //     return res.status(403).json({ success: false, error: 'Please verify your email first' });
        // }

        // Security: Invalidate token if password changed recently
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({ success: false, error: 'Security alert: Password recently changed. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Authenticaton failed. Session may have expired.' });
    }
};

/**
 * @desc    Grant access to specific roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access Denied: Role '${req.user.role}' is not authorized.`
            });
        }
        next();
    };
};
