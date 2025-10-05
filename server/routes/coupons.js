import express from 'express';
import {
  validateCoupon,
  getEligibleCoupons
} from '../controllers/couponController.js';

const router = express.Router();

// Public routes only - admin functions moved to /admin/coupons
router.post('/validate', validateCoupon);
router.get('/eligible', getEligibleCoupons);

export default router;
