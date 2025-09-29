import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getRewardBalance,
  getTransactionHistory,
  getRewardSummary,
  redeemPoints,
  getEarningOpportunities,
  awardReferralBonus,
  awardReviewBonus
} from '../controllers/rewardController.js';

const router = express.Router();

// All reward routes require authentication
router.use(authenticateToken);

// Reward management
router.get('/balance', getRewardBalance);
router.get('/transactions', getTransactionHistory);
router.get('/summary', getRewardSummary);
router.get('/opportunities', getEarningOpportunities);

// Reward actions
router.post('/redeem', redeemPoints);
router.post('/referral-bonus', awardReferralBonus);
router.post('/review-bonus', awardReviewBonus);

export default router;
