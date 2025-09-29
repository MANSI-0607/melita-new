import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// User routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/stats', getOrderStats);
router.get('/:orderId', getOrder);
router.patch('/:orderId/cancel', cancelOrder);

// Admin routes (for order status updates)
router.patch('/:orderId/status', updateOrderStatus);

export default router;
