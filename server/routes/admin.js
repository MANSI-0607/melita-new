import express from 'express';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';
import {
  adminLogin,
  getAdminStats,
  getUsers,
  createUser,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  awardPoints,
  deductPoints,
  getOrders,
  getOrder,
  updateOrderStatus,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  toggleProductStatus,
  deleteProduct,
  getReviews,
  deleteReview,
  getTransactions,
  getTransaction,
  getUsersEnhanced,
  getOrdersEnhanced,
  getTransactionsEnhanced,
  createReviewAsAdmin,
  getReviewsEnhanced,
  updateReviewApproval,
  getAdminCoupons,
  getAdminCouponById,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  toggleAdminCouponStatus,
  getAdminCouponStats,
  getAdminSellers,
  getAdminSellerById,
  createAdminSeller,
  updateAdminSeller,
  updateAdminSellerPassword,
  toggleAdminSellerStatus,
  deleteAdminSeller,
  getAdminSellerStats
} from '../controllers/adminController.js';

const router = express.Router();

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.use(authenticateAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// User management routes
router.get('/users', getUsersEnhanced);
router.post('/users', createUser);
router.get('/users/:userId', getUser);
router.put('/users/:userId', updateUser);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/award-points', awardPoints);
router.post('/users/:userId/deduct-points', deductPoints);

// Order management routes
router.get('/orders', getOrdersEnhanced);
router.get('/orders/:orderId', getOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);

// Product management routes
router.get('/products', getProducts);
router.post('/products', createProduct);
router.get('/products/:productId', getProduct);
router.put('/products/:productId', updateProduct);
router.patch('/products/:productId/status', updateProductStatus);
router.patch('/products/:productId/toggle-status', toggleProductStatus);
router.delete('/products/:productId', deleteProduct);

// Review management routes
router.get('/reviews', getReviewsEnhanced);
router.post('/reviews', createReviewAsAdmin);
router.patch('/reviews/:reviewId/approval', updateReviewApproval);
router.delete('/reviews/:reviewId', deleteReview);

// Transaction management routes
router.get('/transactions', getTransactionsEnhanced);
router.get('/transactions/:transactionId', getTransaction);

// Coupon management routes
router.get('/coupons', getAdminCoupons);
router.get('/coupons/stats', getAdminCouponStats);
router.get('/coupons/:id', getAdminCouponById);
router.post('/coupons', createAdminCoupon);
router.put('/coupons/:id', updateAdminCoupon);
router.patch('/coupons/:id/toggle-status', toggleAdminCouponStatus);
router.delete('/coupons/:id', deleteAdminCoupon);

// Seller management routes
router.get('/sellers', getAdminSellers);
router.get('/sellers/stats', getAdminSellerStats);
router.get('/sellers/:id', getAdminSellerById);
router.post('/sellers', createAdminSeller);
router.put('/sellers/:id', updateAdminSeller);
router.patch('/sellers/:id/password', updateAdminSellerPassword);
router.patch('/sellers/:id/toggle-status', toggleAdminSellerStatus);
router.delete('/sellers/:id', deleteAdminSeller);

// Test route to create sample coupon
router.post('/coupons/test', async (req, res) => {
  try {
    const Coupon = (await import('../models/Coupon.js')).default;
    
    const testCoupon = new Coupon({
      code: 'TEST50',
      type: 'percentage',
      value: 50,
      isGlobal: true,
      usageLimit: 1,
      minOrderAmount: 100,
      validFrom: new Date(),
      description: 'Test coupon - 50% off'
    });
    
    await testCoupon.save();
    
    res.json({
      success: true,
      message: 'Test coupon created',
      data: testCoupon
    });
  } catch (error) {
    console.error('Test coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test coupon',
      error: error.message
    });
  }
});

export default router;
