const express = require('express');
const { getFx, getLoanRate, getCompetitors } = require('../controllers/marketController');

const router = express.Router();
router.get('/fx', getFx);
router.get('/loan-rate', getLoanRate);
router.get('/competitors', getCompetitors);

module.exports = router;
