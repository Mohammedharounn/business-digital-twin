const aiService = require('../services/aiService');

/**
 * Handle AI Strategic Inquiry
 * POST /api/v1/ai/inquiry
 */
exports.handleInquiry = async (req, res, next) => {
    try {
        const { prompt, businessData } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Command prompt required' });
        }

        const insight = await aiService.generateStrategicInsight(prompt, businessData);

        res.status(200).json({
            success: true,
            data: insight
        });
    } catch (err) {
        next(err);
    }
};
