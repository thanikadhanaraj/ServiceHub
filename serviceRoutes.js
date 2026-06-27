const express = require('express');
const router = express.Router();
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createService);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
