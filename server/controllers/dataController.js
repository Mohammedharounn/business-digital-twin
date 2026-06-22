const ActualData = require('../models/ActualData');

// @desc    Get all monthly actuals for current user
// @route   GET /api/v1/data/actuals
// @access  Private
exports.getActuals = async (req, res, next) => {
    try {
        const actuals = await ActualData.find({ user: req.user.id }).sort({ year: 1, month: 1 });
        res.status(200).json({ success: true, data: actuals });
    } catch (err) {
        next(err);
    }
};

// @desc    Upsert a single month's actual data
// @route   POST /api/v1/data/actuals
// @access  Private
exports.upsertActual = async (req, res, next) => {
    try {
        const { month, year, revenue, costs, customers, notes } = req.body;

        if (!month || !revenue) {
            return res.status(400).json({ success: false, error: 'Month and revenue are required' });
        }

        const actual = await ActualData.findOneAndUpdate(
            { user: req.user.id, month, year: year || new Date().getFullYear() },
            { user: req.user.id, month, year: year || new Date().getFullYear(), revenue, costs, customers, notes },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: actual });
    } catch (err) {
        next(err);
    }
};

// @desc    Bulk upload actuals (from CSV)
// @route   POST /api/v1/data/actuals/bulk
// @access  Private
exports.bulkUpload = async (req, res, next) => {
    try {
        const { records } = req.body;

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, error: 'Records array required' });
        }

        const results = [];
        for (const record of records) {
            const { month, year, revenue, costs, customers, notes } = record;
            if (!month || !revenue) continue;

            const actual = await ActualData.findOneAndUpdate(
                { user: req.user.id, month, year: year || new Date().getFullYear() },
                { user: req.user.id, month, year: year || new Date().getFullYear(), revenue, costs, customers, notes },
                { upsert: true, new: true, runValidators: true }
            );
            results.push(actual);
        }

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete all actuals for current user
// @route   DELETE /api/v1/data/actuals
// @access  Private
exports.clearActuals = async (req, res, next) => {
    try {
        await ActualData.deleteMany({ user: req.user.id });
        res.status(200).json({ success: true, message: 'All actual data cleared' });
    } catch (err) {
        next(err);
    }
};
