const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One user. One business simulation for now.
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    avgTicket: {
        type: Number,
        required: true
    },
    config: {
        type: Object, // Raw configuration object from BusinessBuilder
        required: true
    },
    summary: {
        type: Object, // Processed financial summary
        required: true
    },
    risks: {
        type: Object, // Processed risk data
        required: true
    },
    insights: {
        type: Array, // AI generated insights array
        default: []
    },
    scenarios: {
        type: Array, // Scenarios array
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Business', BusinessSchema);
