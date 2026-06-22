const express = require('express');
const router = express.Router();
const { getActuals, upsertActual, bulkUpload, clearActuals } = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

router.route('/actuals')
    .get(protect, getActuals)
    .post(protect, upsertActual)
    .delete(protect, clearActuals);

router.post('/actuals/bulk', protect, bulkUpload);

module.exports = router;
