import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getUserAddresses,
  addAddress,
  getAvailableCoupons,
  applyCoupon,
  createCodOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/checkoutController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Address routes
router.get('/addresses', getUserAddresses);
router.post('/addresses', addAddress);

// Coupon routes
router.get('/coupons', getAvailableCoupons);
router.post('/coupons/apply', applyCoupon);

// Order routes
router.post('/orders', createCodOrder);
router.post('/orders/razorpay', createRazorpayOrder);
router.post('/orders/verify-payment', verifyRazorpayPayment);

export default router;
