const RefreshToken = require('./models/RefreshToken');

/**
 * Cleanup expired tokens from the database.
 * This can be run as a cron job or a background interval.
 */
const cleanupExpiredTokens = async () => {
    try {
        const result = await RefreshToken.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        if (result.deletedCount > 0) {
            console.log(`[Cleanup] Removed ${result.deletedCount} expired refresh tokens`);
        }
    } catch (err) {
        console.error('[Cleanup] Error removing expired tokens:', err.message);
    }
};

module.exports = cleanupExpiredTokens;
