const express = require('express');
const { searchEbay, addToBusiness, removeFromBusiness } = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/search', searchEbay);
router.post('/add-to-business', addToBusiness);
router.delete('/remove-from-business/:productId', removeFromBusiness);

module.exports = router;
