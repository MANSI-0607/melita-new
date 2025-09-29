import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  getDashboardData,
  updatePassword,
  deleteAccount,
  getReferralData,
  updateNotificationPreferences,
  getLoyaltyInfo
} from '../controllers/profileController.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/dashboard', getDashboardData);
router.delete('/account', deleteAccount);

// Password management (placeholder for future implementation)
router.put('/password', updatePassword);

// Referral system
router.get('/referral', getReferralData);

// Notification preferences
router.put('/notifications', updateNotificationPreferences);

// Loyalty program
router.get('/loyalty', getLoyaltyInfo);

export default router;
