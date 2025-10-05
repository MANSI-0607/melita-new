import express from 'express';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import User from '../models/User.js';
import { sendOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

// Seller login
router.post('/login', async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Validate required fields
    if (!contact || !password) {
      return res.status(400).json({
        success: false,
        message: 'Contact number and password are required'
      });
    }

    // Find seller by contact
    const seller = await Seller.findOne({ contact }).select('+password');

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if seller is active
    if (seller.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account has been ' + (seller.status === 'banned' ? 'banned' : 'deactivated') + '. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await seller.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    seller.lastLogin = new Date();
    await seller.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: seller._id,
        contact: seller.contact,
        type: 'seller'
      },
      process.env.JWT_SECRET || 'melita_dev_secret',
      { expiresIn: '7d' }
    );

    // Return seller data (without password) and token
    const sellerResponse = seller.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        seller: sellerResponse,
        token
      }
    });

  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Middleware to authenticate seller
export const authenticateSeller = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'melita_dev_secret');

    // Check if it's a seller token
    if (decoded.type !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Seller access required'
      });
    }

    req.seller = decoded;
    next();
  } catch (error) {
    console.error('Seller auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Get current seller profile (Protected)
router.get('/profile', authenticateSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update seller profile (Protected)
router.put('/profile', authenticateSeller, async (req, res) => {
  try {
    const { name } = req.body;

    const seller = await Seller.findById(req.seller.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update name if provided
    if (name) {
      seller.name = name.trim();
    }

    await seller.save();

    const sellerResponse = seller.toJSON();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sellerResponse
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password (Protected)
router.patch('/change-password', authenticateSeller, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const seller = await Seller.findById(req.seller.id).select('+password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await seller.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    seller.password = newPassword;
    await seller.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change seller password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get seller dashboard stats (Protected)
router.get('/dashboard-stats', authenticateSeller, async (req, res) => {
  try {
    const sellerId = req.seller.id;

    // For now, return mock data since we don't have sales/order models yet
    // In a real implementation, you would query actual sales and order data

    res.json({
      success: true,
      data: {
        salesToday: 0.00,
        salesThisMonth: 0.00,
        ordersToday: 0
      }
    });
  } catch (error) {
    console.error('Get seller dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Add customer - Send OTP (Protected)
router.post('/add-customer/send-otp', authenticateSeller, async (req, res) => {
  try {
    const { phone, name } = req.body;
    
    // Get seller info
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Prepare request body with seller info injected as addedBy
    const otpRequest = {
      phone,
      name,
      type: 'signup',
      addedBy: {
        name: seller.name,
        phone: seller.contact
      }
    };

    // Create a mock request object for the auth controller
    const mockReq = { body: otpRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json({
          success: code < 400,
          ...data
        })
      }),
      json: (data) => res.json({
        success: true,
        ...data
      })
    };

    // Call the auth controller's sendOtp function
    await sendOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Seller add customer send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Add customer - Verify OTP (Protected)
router.post('/add-customer/verify-otp', authenticateSeller, async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    // Prepare request body for verification
    const verifyRequest = {
      phone,
      otp,
      type: 'signup'
    };

    // Create a mock request object for the auth controller
    const mockReq = { body: verifyRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json({
          success: code < 400,
          ...data
        })
      }),
      json: (data) => {
        // Update seller's customer count on successful verification
        if (data.success) {
          Seller.findByIdAndUpdate(req.seller.id, { $inc: { totalCustomers: 1 } })
            .catch(err => console.error('Failed to update seller customer count:', err));
        }
        
        res.json({
          success: true,
          ...data
        });
      }
    };

    // Call the auth controller's verifyOtp function
    await verifyOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Seller add customer verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Get customers added by this seller (Protected)
router.get('/customers', authenticateSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Find users added by this seller
    const customers = await User.find({
      'addedBy.phone': seller.contact
    }).select('name phone isVerified createdAt rewardPoints loyaltyTier').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get seller customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});

export default router;
