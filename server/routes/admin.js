import express from 'express';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';
import {
  adminLogin,
  getAdminStats,
  getUsers,
  getUsersEnhanced,
  getUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  awardPoints,
  deductPoints,
  getOrders,
  getOrdersEnhanced,
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
  getReviewsEnhanced,
  updateReviewApproval,
  deleteReview,
  getTransactions,
  getTransactionsEnhanced,
  getTransaction
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
router.patch('/reviews/:reviewId/approval', updateReviewApproval);
router.delete('/reviews/:reviewId', deleteReview);

// Transaction management routes
router.get('/transactions', getTransactionsEnhanced);
router.get('/transactions/:transactionId', getTransaction);

export default router;
