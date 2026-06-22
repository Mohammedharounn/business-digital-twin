const mongoose = require('mongoose');

const ActualDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 24
    },
    year: {
        type: Number,
        default: () => new Date().getFullYear()
    },
    revenue: {
        type: Number,
        required: true
    },
    costs: {
        type: Number,
        default: 0
    },
    customers: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index: one entry per user per month per year
ActualDataSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ActualData', ActualDataSchema);
