const { searchProducts } = require('../services/ebayService');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Search eBay products
// @route   GET /api/v1/marketplace/search?q=...&limit=20&offset=0
// @access  Private
exports.searchEbay = async (req, res, next) => {
    try {
        const query = (req.query.q || '').trim();
        if (!query) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);

        const results = await searchProducts(query, limit, offset);

        res.status(200).json({ success: true, ...results });
    } catch (err) {
        console.error('[Marketplace] Search error:', err.message, err.code);

        const statusMap = { RATE_LIMIT: 429, INVALID_TOKEN: 401, API_ERROR: err.status || 502, NETWORK_ERROR: 503 };
        const status = statusMap[err.code] || 500;
        const msg = err.code === 'RATE_LIMIT' ? 'eBay rate limit reached — please wait a moment and try again.'
            : err.code === 'NETWORK_ERROR' ? 'Could not reach eBay. Check your internet connection.'
            : err.message;

        res.status(status).json({ success: false, error: msg, code: err.code });
    }
};

// @desc    Add eBay product to the active project's equipment
// @route   POST /api/v1/marketplace/add-to-business
// @access  Private
exports.addToBusiness = async (req, res, next) => {
    try {
        const { product } = req.body;

        if (!product?.id || !product?.title) {
            return res.status(400).json({ success: false, error: 'Invalid product data' });
        }

        // Find the user's active project
        const user = await User.findById(req.user.id).select('activeProjectId');
        const projectId = user?.activeProjectId;

        if (!projectId) {
            return res.status(404).json({ success: false, error: 'No active project. Please open a project first.' });
        }

        const project = await Project.findOne({ _id: projectId, user: req.user.id });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Active project not found' });
        }

        // Build the equipment entry
        const entry = {
            id: product.id,
            title: product.title,
            image: product.image || null,
            price: product.price || 0,
            currency: product.currency || 'USD',
            condition: product.condition || 'Unknown',
            url: product.url || null,
            category: product.category || 'General',
            seller: product.seller?.username || null,
            addedAt: new Date().toISOString(),
        };

        // Merge into existing config
        const config = project.config || {};
        const existingEquipment = Array.isArray(config.purchasedEquipment) ? config.purchasedEquipment : [];

        // Prevent duplicate additions
        const alreadyAdded = existingEquipment.some(e => e.id === entry.id);
        if (alreadyAdded) {
            return res.status(409).json({ success: false, error: 'This product is already in your business equipment.' });
        }

        const updatedEquipment = [...existingEquipment, entry];

        // Recalculate total equipment cost
        const priceEGP = entry.price * (parseFloat(process.env.USD_TO_EGP_RATE) || 50);
        const currentEquipmentCost = parseFloat(config.equipmentCost) || 0;
        const newEquipmentCost = currentEquipmentCost + priceEGP;

        const updatedConfig = {
            ...config,
            equipmentCost: newEquipmentCost,
            purchasedEquipment: updatedEquipment,
        };

        await Project.findByIdAndUpdate(
            projectId,
            { $set: { config: updatedConfig } },
            { runValidators: false }
        );

        console.log(`[Marketplace] Added "${entry.title}" (E£${priceEGP.toFixed(0)}) to project ${projectId}`);

        res.status(200).json({
            success: true,
            data: {
                product: entry,
                updatedConfig: { equipmentCost: newEquipmentCost, purchasedEquipment: updatedEquipment },
            },
        });
    } catch (err) {
        console.error('[Marketplace] Add-to-business error:', err.message);
        next(err);
    }
};

// @desc    Remove a product from the active project's equipment
// @route   DELETE /api/v1/marketplace/remove-from-business/:productId
// @access  Private
exports.removeFromBusiness = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.id).select('activeProjectId');
        const project = await Project.findOne({ _id: user?.activeProjectId, user: req.user.id });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Active project not found' });
        }

        const config = project.config || {};
        const existing = Array.isArray(config.purchasedEquipment) ? config.purchasedEquipment : [];
        const item = existing.find(e => e.id === productId);

        if (!item) {
            return res.status(404).json({ success: false, error: 'Product not found in your equipment' });
        }

        const priceEGP = item.price * (parseFloat(process.env.USD_TO_EGP_RATE) || 50);
        const updatedEquipment = existing.filter(e => e.id !== productId);
        const newEquipmentCost = Math.max(0, (parseFloat(config.equipmentCost) || 0) - priceEGP);

        const updatedConfig = { ...config, equipmentCost: newEquipmentCost, purchasedEquipment: updatedEquipment };
        await Project.findByIdAndUpdate(project._id, { $set: { config: updatedConfig } });

        res.status(200).json({
            success: true,
            data: { updatedConfig: { equipmentCost: newEquipmentCost, purchasedEquipment: updatedEquipment } },
        });
    } catch (err) {
        next(err);
    }
};
