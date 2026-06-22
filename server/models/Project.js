const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true   // NOT unique — one user can have many projects
    },
    projectName: { type: String, trim: true, default: 'Untitled Project' },
    // All business fields have safe defaults so an EMPTY project can be
    // created immediately (no validation errors on first insert).
    businessName: { type: String, trim: true, default: '' },
    businessType: { type: String, default: '' },
    location: { type: String, default: '' },
    avgTicket: { type: Number, default: 0 },
    config: { type: Object, default: {} },
    summary: { type: Object, default: {} },
    risks: { type: Object, default: {} },
    insights: { type: Array, default: [] },
    scenarios: { type: Array, default: [] },
    // Digital twin scene/layout data (equipment, placements, design theme)
    digitalTwin: { type: Object, default: {} },
    // Read-only investor share link token (null = not shared)
    shareId: { type: String, default: null, index: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
