const crypto = require('crypto');
const Project = require('../models/Project');
const User = require('../models/User');

// ── Founder Score: blends profitability, ROI and (inverse) risk into 0–1000 ──
function founderScore(p) {
    const s = p.summary || {};
    const r = p.risks || {};
    const margin = parseFloat(s.profitMargin) || 0;                 // %
    const roi = parseFloat(s.roi?.roi ?? s.roi) || 0;              // %
    const risk = parseFloat(r.riskScore?.score ?? r.riskScore) || 50; // 0–100 (higher = riskier)
    const annualProfit = parseFloat(s.annualProfit) || 0;
    const profitPoints = Math.min(400, Math.max(0, annualProfit / 5000)); // up to 400
    const score = Math.round(
        Math.min(300, margin * 6) +          // margin → up to 300
        Math.min(200, roi * 2) +             // roi → up to 200
        Math.max(0, 100 - risk) +            // low risk → up to 100
        profitPoints                          // scale → up to 400
    );
    return Math.max(0, Math.min(1000, score));
}

// @desc    Get all projects for this user
// @route   GET /api/v1/business
// @access  Private
exports.getMyProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user.id }).sort({ updatedAt: -1 });
        const user = await User.findById(req.user.id).select('activeProjectId');

        res.status(200).json({
            success: true,
            data: projects,
            activeProjectId: user?.activeProjectId || null
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get a specific project by ID
// @route   GET /api/v1/business/:id
// @access  Private
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new (possibly empty) project OR update existing by projectId
// @route   POST /api/v1/business
// @access  Private
exports.saveProject = async (req, res, next) => {
    try {
        const { projectId } = req.body;

        // Only copy fields that were actually provided — never overwrite
        // existing data with `undefined` (protects partial updates like rename).
        const ALLOWED = ['projectName', 'businessName', 'businessType', 'location',
            'avgTicket', 'config', 'summary', 'risks', 'insights', 'scenarios', 'digitalTwin'];
        const updates = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        if (projectId) {
            // Update existing project (partial)
            const project = await Project.findOneAndUpdate(
                { _id: projectId, user: req.user.id },
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!project) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }

            console.log(`[Project] Updated ${project._id} for user ${req.user.id}`);
            return res.status(200).json({ success: true, data: project });
        }

        // Create new project — defaults in the schema allow an empty record
        const project = await Project.create({ user: req.user.id, ...updates });

        // Set as the active project
        await User.findByIdAndUpdate(req.user.id, { activeProjectId: project._id });

        console.log(`[Project] Created ${project._id} ("${project.projectName}") for user ${req.user.id}`);
        res.status(201).json({ success: true, data: project });
    } catch (err) {
        console.error('[Project] saveProject failed:', err.message);
        next(err);
    }
};

// @desc    Set a project as active
// @route   PATCH /api/v1/business/:id/active
// @access  Private
exports.setActiveProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        await User.findByIdAndUpdate(req.user.id, { activeProjectId: project._id });

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
};

// @desc    Clear active project (no active project = start fresh)
// @route   PATCH /api/v1/business/active/clear
// @access  Private
exports.clearActiveProject = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { activeProjectId: null });
        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};

// @desc    Update scenarios for a specific project
// @route   PATCH /api/v1/business/:id/scenarios
// @access  Private
exports.saveScenarios = async (req, res, next) => {
    try {
        const { scenarios } = req.body;

        if (!Array.isArray(scenarios)) {
            return res.status(400).json({ success: false, error: 'scenarios must be an array' });
        }

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { scenarios },
            { new: true, runValidators: false }
        );

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
};

// @desc    Duplicate a project
// @route   POST /api/v1/business/:id/duplicate
// @access  Private
exports.duplicateProject = async (req, res, next) => {
    try {
        const original = await Project.findOne({ _id: req.params.id, user: req.user.id });

        if (!original) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const copy = await Project.create({
            user: req.user.id,
            projectName: `${original.projectName} (Copy)`,
            businessName: original.businessName,
            businessType: original.businessType,
            location: original.location,
            avgTicket: original.avgTicket,
            config: original.config,
            summary: original.summary,
            risks: original.risks,
            insights: original.insights,
            scenarios: original.scenarios
        });

        res.status(201).json({ success: true, data: copy });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a project
// @route   DELETE /api/v1/business/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // If this was the active project, clear active
        const user = await User.findById(req.user.id).select('activeProjectId');
        if (user?.activeProjectId?.toString() === req.params.id) {
            await User.findByIdAndUpdate(req.user.id, { activeProjectId: null });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Founder leaderboard — ranks projects by Founder Score
// @route   GET /api/v1/business/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
    try {
        const projects = await Project.find({}).populate('user', 'name email').lean();
        const ranked = projects
            .map(p => ({
                id: p._id,
                name: p.projectName || p.businessName || 'Untitled',
                businessType: p.businessType || '—',
                location: p.location || '—',
                owner: p.user?.name || (p.user?.email ? p.user.email.split('@')[0] : 'Founder'),
                score: founderScore(p),
                isMine: req.user && p.user && String(p.user._id) === String(req.user.id),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 25)
            .map((row, i) => ({ rank: i + 1, ...row }));
        res.status(200).json({ success: true, data: ranked });
    } catch (err) {
        next(err);
    }
};

// @desc    Generate (or revoke) a read-only investor share link for a project
// @route   POST /api/v1/business/:id/share   body: { enable: true|false }
// @access  Private
exports.generateShare = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        const enable = req.body?.enable !== false; // default true
        if (enable) {
            if (!project.shareId) project.shareId = crypto.randomBytes(9).toString('hex');
        } else {
            project.shareId = null;
        }
        await project.save();
        res.status(200).json({ success: true, shareId: project.shareId });
    } catch (err) {
        next(err);
    }
};

// @desc    Public read-only twin view (no auth) by share token
// @route   GET /api/v1/public/twin/:shareId
// @access  Public
exports.getPublicTwin = async (req, res, next) => {
    try {
        const project = await Project.findOne({ shareId: req.params.shareId })
            .select('projectName businessName businessType location avgTicket config summary risks insights updatedAt')
            .lean();
        if (!project) return res.status(404).json({ success: false, error: 'Shared twin not found or link revoked' });
        res.status(200).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
};

const Comment = require('../models/Comment');
const sendEmail = require('../utils/sendEmail');

// @desc    List comments for a project   @route GET /api/v1/business/:id/comments
exports.getComments = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id }).select('_id');
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        const comments = await Comment.find({ project: req.params.id }).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, data: comments });
    } catch (err) { next(err); }
};

// @desc    Add a comment   @route POST /api/v1/business/:id/comments  { text }
exports.addComment = async (req, res, next) => {
    try {
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ success: false, error: 'Comment text is required' });
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id }).select('_id');
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        const user = await User.findById(req.user.id).select('name email');
        const comment = await Comment.create({
            project: req.params.id,
            user: req.user.id,
            authorName: user?.name || (user?.email ? user.email.split('@')[0] : 'Operative'),
            text,
        });
        res.status(201).json({ success: true, data: comment });
    } catch (err) { next(err); }
};

// @desc    Delete a comment   @route DELETE /api/v1/business/:id/comments/:commentId
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, project: req.params.id, user: req.user.id });
        if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) { next(err); }
};

// @desc    Email a summary report of a project   @route POST /api/v1/business/:id/email-report
exports.emailReport = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id }).lean();
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        const user = await User.findById(req.user.id).select('name email');
        if (!user?.email) return res.status(400).json({ success: false, error: 'No email on file' });

        const s = project.summary || {};
        const fmt = (v) => (v == null ? '—' : `E£${Number(v).toLocaleString()}`);
        const name = project.businessName || project.projectName || 'Your Business';
        const lines = [
            `Business Digital Twin — Report for ${name}`,
            `Type: ${project.businessType || '—'}   Location: ${project.location || '—'}`,
            ``,
            `Monthly Revenue: ${fmt(s.monthlyRevenue)}`,
            `Monthly Profit:  ${fmt(s.monthlyProfit)}`,
            `Profit Margin:   ${s.profitMargin != null ? s.profitMargin + '%' : '—'}`,
            `Startup Capital: ${fmt(s.startup?.total ?? s.startup)}`,
            `Annual Revenue:  ${fmt(s.annualRevenue)}`,
            `Annual Profit:   ${fmt(s.annualProfit)}`,
            ``,
            `Generated by Business Digital Twin.`,
        ];

        await sendEmail({
            email: user.email,
            subject: `Your Business Digital Twin Report — ${name}`,
            message: lines.join('\n'),
            html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0c15;color:#fafafa;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.1)">
                <h2 style="color:#6366f1;margin-top:0">Business Digital Twin</h2>
                <h3 style="margin:4px 0 16px">${name}</h3>
                <p style="color:#94a3b8;font-size:13px;margin:0 0 16px">${project.businessType || '—'} · ${project.location || '—'}</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                    ${[['Monthly Revenue', fmt(s.monthlyRevenue)], ['Monthly Profit', fmt(s.monthlyProfit)], ['Profit Margin', s.profitMargin != null ? s.profitMargin + '%' : '—'], ['Startup Capital', fmt(s.startup?.total ?? s.startup)], ['Annual Revenue', fmt(s.annualRevenue)], ['Annual Profit', fmt(s.annualProfit)]].map(([k, v]) => `<tr><td style="padding:8px 0;color:#94a3b8">${k}</td><td style="padding:8px 0;text-align:right;font-weight:bold">${v}</td></tr>`).join('')}
                </table>
            </div>`,
        });
        res.status(200).json({ success: true, message: `Report emailed to ${user.email}` });
    } catch (err) {
        console.error('[emailReport]', err.message);
        res.status(502).json({ success: false, error: 'Could not send email (SMTP). ' + err.message });
    }
};
