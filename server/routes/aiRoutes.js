const express = require('express');
const { handleInquiry } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// protect all routes
router.use(protect);

router.post('/inquiry', handleInquiry);

module.exports = router;
