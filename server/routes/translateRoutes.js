const express = require('express');
const { translateBatch } = require('../controllers/translateController');

const router = express.Router();
router.post('/', translateBatch);

module.exports = router;
