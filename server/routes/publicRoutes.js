const express = require('express');
const { getPublicTwin } = require('../controllers/businessController');

// Public, UNAUTHENTICATED routes — read-only investor share links.
const router = express.Router();

router.get('/twin/:shareId', getPublicTwin);

module.exports = router;
