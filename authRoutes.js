const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    registerProvider,
    login,
    getProfile,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/register-provider', registerProvider);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
