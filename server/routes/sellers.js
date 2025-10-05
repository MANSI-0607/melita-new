import express from 'express';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

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

export default router;
