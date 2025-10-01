import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sendOtp, verifyOtp, getProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);

// Verify OTP endpoint
router.post('/verify-otp', verifyOtp);

// Get user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

export default router;
