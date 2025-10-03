import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
  getCouponStats
} from '../controllers/couponController.js';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Protected routes (Admin only)
router.use(authenticateAdmin);

// Admin coupon management routes
router.get('/', getAllCoupons);
router.get('/stats', getCouponStats);
router.get('/:id', getCouponById);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.patch('/:id/toggle-status', toggleCouponStatus);
router.delete('/:id', deleteCoupon);

export default router;
