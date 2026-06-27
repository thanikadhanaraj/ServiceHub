const express = require('express');
const router = express.Router();
const { getProvidersByCategory, getProviderById } = require('../controllers/providerController');

router.get('/category/:category', getProvidersByCategory);
router.get('/:id', getProviderById);

module.exports = router;
