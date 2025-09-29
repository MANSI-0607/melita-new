import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  getReviewStats,
  canUserReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/stats', getReviewStats);
router.post('/product/:productId/helpful/:reviewId', markReviewHelpful);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/product/:productId', createReview);
router.get('/product/:productId/can-review', canUserReview);
router.get('/user', getUserReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;
