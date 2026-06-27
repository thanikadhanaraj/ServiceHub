const express = require('express');
const router = express.Router();
const {
    processMockPayment,
    getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/mock', protect, processMockPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
