import express from 'express';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';
import {
  adminLogin,
  getAdminStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  awardPoints,
  deductPoints,
  getOrders,
  getOrder,
  updateOrderStatus,
  getProducts,
  getProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getReviews,
  deleteReview,
  getTransactions,
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
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/award-points', awardPoints);
router.post('/users/:userId/deduct-points', deductPoints);

// Order management routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);

// Product management routes
router.get('/products', getProducts);
router.get('/products/:productId', getProduct);
router.put('/products/:productId', updateProduct);
router.patch('/products/:productId/toggle-status', toggleProductStatus);
router.delete('/products/:productId', deleteProduct);

// Review management routes
router.get('/reviews', getReviews);
router.delete('/reviews/:reviewId', deleteReview);

// Transaction management routes
router.get('/transactions', getTransactions);
router.get('/transactions/:transactionId', getTransaction);

export default router;
