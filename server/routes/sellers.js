import express from 'express';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
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

// Get customer's available coupons (Protected)
router.get('/customer-coupons/:customerId', authenticateSeller, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer belongs to this seller
    const seller = await Seller.findById(req.seller.id);
    const customer = await User.findOne({
      _id: customerId,
      'addedBy.phone': seller.contact
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or not created by this seller'
      });
    }

    // Find available coupons for this customer
    const now = new Date();
    const coupons = await Coupon.find({
      $and: [
        {
          $or: [
            { isGlobal: true },
            { userId: customerId },
            { userPhone: customer.phone }
          ]
        },
        { isActive: true },
        {
          $or: [
            { validUntil: null },
            { validUntil: { $gte: now } }
          ]
        },
        { validFrom: { $lte: now } }
      ]
    }).select('_id code type value minOrderAmount maxDiscountAmount description userId userPhone isGlobal usageLimit');

    // Exclude one-time coupons already used by this customer
    const usedCouponIds = await Transaction.distinct('metadata.couponId', {
      user: customer._id,
      'metadata.source': 'coupon'
    });

    const filtered = coupons.filter(c => {
      if (c.usageLimit === 1 && usedCouponIds && usedCouponIds.length) {
        return !usedCouponIds.map(String).includes(String(c._id));
      }
      return true;
    });

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Get customer coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer coupons'
    });
  }
});

// Record sale - Send OTP (Protected)
router.post('/record-sale/send-otp', authenticateSeller, async (req, res) => {
  try {
    const { customerId, items, couponId, coinsUsed, total } = req.body;

    // Verify customer belongs to this seller
    const seller = await Seller.findById(req.seller.id);
    const customer = await User.findOne({
      _id: customerId,
      'addedBy.phone': seller.contact
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or not created by this seller'
      });
    }

    // Validate items and stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }
      if (product.inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }
    }

    // Validate coupon if provided
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon'
        });
      }
    }

    // Validate coins
    if (coinsUsed > customer.rewardPoints) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient reward points'
      });
    }

    // Store sale data temporarily (you might want to use Redis or session storage)
    const saleData = {
      sellerId: req.seller.id,
      customerId,
      items,
      couponId,
      coinsUsed,
      total,
      timestamp: new Date()
    };

    // For now, store in memory (in production, use Redis)
    global.pendingSales = global.pendingSales || new Map();
    global.pendingSales.set(customer.phone, saleData);

    // Send OTP using existing auth controller
    const otpRequest = {
      phone: customer.phone,
      name: customer.name,
      type: 'login'
    };

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

    await sendOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Record sale send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Record sale - Verify OTP and complete order (Protected)
router.post('/record-sale/verify-otp', authenticateSeller, async (req, res) => {
  try {
    const { customerId, otp } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get pending sale data
    global.pendingSales = global.pendingSales || new Map();
    const saleData = global.pendingSales.get(customer.phone);

    if (!saleData) {
      return res.status(400).json({
        success: false,
        message: 'No pending sale found'
      });
    }

    // Verify OTP using existing auth controller
    const verifyRequest = {
      phone: customer.phone,
      otp,
      type: 'login'
    };

    // Create a promise to capture the auth controller response
    let otpValid = false;
    const mockReq = { body: verifyRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          otpValid = code < 400;
          return { status: code, data };
        }
      }),
      json: (data) => {
        otpValid = true;
        return { status: 200, data };
      }
    };

    try {
      await verifyOtp(mockReq, mockRes);
    } catch (error) {
      otpValid = false;
    }

    if (!otpValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Create order
    const orderItems = [];
    let subtotal = 0;

    for (const item of saleData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // Update product inventory
      product.inventory.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      });

      subtotal += item.price * item.quantity;
    }

    // Calculate discounts
    let couponDiscount = 0;
    if (saleData.couponId) {
      const coupon = await Coupon.findById(saleData.couponId);
      if (coupon) {
        if (coupon.type === 'percentage') {
          couponDiscount = (subtotal * coupon.value) / 100;
        } else {
          couponDiscount = coupon.value;
        }
        if (coupon.maxDiscountAmount) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
        }
      }
    }

    const coinsDiscount = saleData.coinsUsed || 0;
    const finalTotal = Math.max(0, subtotal - couponDiscount - coinsDiscount);

    // Create order
    const order = new Order({
      orderNumber: `SO${Date.now()}${Math.floor(Math.random() * 1000)}`,
      user: customerId,
      items: orderItems,
      pricing: {
        subtotal,
        discount: couponDiscount + coinsDiscount,
        total: finalTotal
      },
      status: 'sellerOrder',
      payment: {
        method: 'cod',
        status: 'completed'
      },
      shipping: {
        address: {
          fullName: customer.name,
          phone: customer.phone,
          addressLine1: 'Seller Store',
          city: 'Store Location',
          state: 'Store State',
          pincode: '000000'
        }
      },
      metadata: {
        sellerId: saleData.sellerId,
        sellerName: (await Seller.findById(saleData.sellerId)).name,
        couponUsed: saleData.couponId ? (await Coupon.findById(saleData.couponId)).code : null,
        couponId: saleData.couponId || null,
        coinsUsed: saleData.coinsUsed || 0
      }
    });

    await order.save();

    // Update customer reward points
    if (saleData.coinsUsed > 0) {
      customer.rewardPoints -= saleData.coinsUsed;
    }

    // Award points for purchase (1 point per ₹10 spent)
    const pointsEarned = Math.floor(finalTotal / 10);
    customer.rewardPoints += pointsEarned;
    await customer.save();

    // Create transaction records
    if (saleData.coinsUsed > 0) {
      await Transaction.createRedemption({
        userId: customerId,
        orderId: order._id,
        category: 'purchase',
        amount: saleData.coinsUsed,
        points: saleData.coinsUsed,
        description: `Coins used for order ${order.orderNumber}`,
        source: 'seller'
      });
    }

    if (pointsEarned > 0) {
      await Transaction.createEarning({
        userId: customerId,
        orderId: order._id,
        category: 'purchase',
        amount: finalTotal,
        points: pointsEarned,
        description: `Points earned from order ${order.orderNumber}`,
        source: 'seller'
      });
    }

    // Clean up pending sale
    global.pendingSales.delete(customer.phone);

    res.json({
      success: true,
      message: 'Sale completed successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: finalTotal,
        pointsEarned
      }
    });

  } catch (error) {
    console.error('Record sale verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete sale'
    });
  }
});

// Get seller orders (Protected)
router.get('/orders', authenticateSeller, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      'metadata.sellerId': req.seller.id
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalOrders / parseInt(limit)),
          total: totalOrders
        }
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

export default router;
