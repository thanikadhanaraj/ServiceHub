const express = require('express');
const router = express.Router();
const {
    addReview,
    getProviderReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/provider/:provider_id', getProviderReviews);

module.exports = router;
