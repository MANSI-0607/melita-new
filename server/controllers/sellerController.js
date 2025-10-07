import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
import { sendOtp, verifyOtp } from './authController.js';

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

// Seller login
export const login = async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Input validation
    if (!contact || !password) {
      return res.status(400).json({
        success: false,
        message: 'Contact number and password are required',
        errors: {
          contact: !contact ? 'Contact number is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate contact format (basic phone number validation)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(contact)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number',
        errors: { contact: 'Invalid phone number format' }
      });
    }

    const seller = await Seller.findOne({ contact }).select('+password');

    if (!seller) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        errors: { credentials: 'Phone number or password is incorrect' }
      });
    }

    if (seller.status !== 'active') {
      const statusMessage = seller.status === 'banned' 
        ? 'Your account has been banned. Please contact administrator.' 
        : 'Your account has been deactivated. Please contact administrator.';
      
      return res.status(401).json({
        success: false,
        message: statusMessage,
        errors: { account: `Account status: ${seller.status}` }
      });
    }

    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        errors: { credentials: 'Phone number or password is incorrect' }
      });
    }

    // Update last login
    seller.lastLogin = new Date();
    await seller.save();

    const token = jwt.sign(
      { id: seller._id, contact: seller.contact, type: 'seller' },
      process.env.JWT_SECRET || 'melita_dev_secret',
      { expiresIn: '7d' }
    );

    const sellerResponse = seller.toJSON();
    res.json({ 
      success: true, 
      message: 'Login successful', 
      data: { seller: sellerResponse, token } 
    });
  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      errors: { server: 'Internal server error occurred' }
    });
  }
};

// Get current seller profile
export const getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select('-password');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json({ success: true, data: seller });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// Update seller profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    if (name) seller.name = name.trim();
    await seller.save();
    const sellerResponse = seller.toJSON();
    res.json({ success: true, message: 'Profile updated successfully', data: sellerResponse });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const seller = await Seller.findById(req.seller.id).select('+password');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const isCurrentPasswordValid = await seller.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    seller.password = newPassword;
    await seller.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change seller password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const seller = await Seller.findById(sellerId);
    
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Ensure salesData exists with defaults
    if (!seller.salesData) {
      seller.salesData = {
        today: { sales: 0, orders: 0, date: new Date() },
        thisMonth: { sales: 0, orders: 0, month: new Date().getMonth(), year: new Date().getFullYear() }
      };
      await seller.save();
    }

    // Reset today's data if it's a new day
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!seller.salesData.today.date || seller.salesData.today.date < todayStart) {
      seller.salesData.today.sales = 0;
      seller.salesData.today.orders = 0;
      seller.salesData.today.date = today;
      await seller.save();
    }

    // Reset month's data if it's a new month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (seller.salesData.thisMonth.month !== currentMonth || seller.salesData.thisMonth.year !== currentYear) {
      seller.salesData.thisMonth.sales = 0;
      seller.salesData.thisMonth.orders = 0;
      seller.salesData.thisMonth.month = currentMonth;
      seller.salesData.thisMonth.year = currentYear;
      await seller.save();
    }

    res.json({ 
      success: true, 
      data: { 
        salesToday: Number(seller.salesData.today.sales.toFixed(2)), 
        salesThisMonth: Number(seller.salesData.thisMonth.sales.toFixed(2)), 
        ordersToday: seller.salesData.today.orders,
        ordersThisMonth: seller.salesData.thisMonth.orders,
        totalSales: Number((seller.totalSales || 0).toFixed ? seller.totalSales.toFixed(2) : Number(seller.totalSales || 0).toFixed(2)),
        totalOrders: seller.totalOrders || 0
      } 
    });
  } catch (error) {
    console.error('Get seller dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// Add customer - Send OTP
export const addCustomerSendOtp = async (req, res) => {
  try {
    const { phone, name } = req.body;

    // Input validation
    if (!phone || !name) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and name are required',
        errors: {
          phone: !phone ? 'Phone number is required' : null,
          name: !name ? 'Customer name is required' : null
        }
      });
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number',
        errors: { phone: 'Invalid phone number format' }
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
        errors: { name: 'Name too short' }
      });
    }

    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found',
        errors: { seller: 'Seller account not found' }
      });
    }

    // Check if customer already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      // If user is already verified, block to prevent duplicates
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this phone number already exists',
          errors: { phone: 'Phone number already registered' }
        });
      }

      // If user exists but is NOT verified, allow OTP resend and update name/addedBy
      if (existingUser.name !== name.trim()) {
        existingUser.name = name.trim();
      }
      existingUser.addedBy = {
        name: seller.name,
        phone: seller.contact
      };
      await existingUser.save();

      const otpRequest = {
        phone: phone.trim(),
        name: name.trim(),
        type: 'login', // user exists; use login flow to resend OTP
        addedBy: { name: seller.name, phone: seller.contact }
      };

      const mockReq = { body: otpRequest };
      const mockRes = {
        status: (code) => ({
          json: (data) => res.status(code).json({ success: code < 400, ...data })
        }),
        json: (data) => res.json({ success: true, ...data })
      };

      await sendOtp(mockReq, mockRes);
      return; // important: stop further execution
    }

    const otpRequest = {
      phone: phone.trim(),
      name: name.trim(),
      type: 'signup',
      addedBy: { name: seller.name, phone: seller.contact }
    };

    const mockReq = { body: otpRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json({ success: code < 400, ...data })
      }),
      json: (data) => res.json({ success: true, ...data })
    };

    await sendOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Seller add customer send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      errors: { server: 'Internal server error occurred' }
    });
  }
};

// Add customer - Verify OTP
export const addCustomerVerifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const verifyRequest = { phone, otp, type: 'signup' };

    const mockReq = { body: verifyRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json({ success: code < 400, ...data })
      }),
      json: (data) => {
        if (data.success) {
          Seller.findByIdAndUpdate(req.seller.id, { $inc: { totalCustomers: 1 } })
            .catch(err => console.error('Failed to update seller customer count:', err));
        }
        res.json({ success: true, ...data });
      }
    };

    await verifyOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Seller add customer verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

// Get customers added by this seller
export const getCustomers = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const customers = await User.find({ 'addedBy.phone': seller.contact })
      .select('name phone isVerified createdAt rewardPoints loyaltyTier')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Get seller customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

// Get customer's available coupons
export const getCustomerCoupons = async (req, res) => {
  try {
    const { customerId } = req.params;

    const seller = await Seller.findById(req.seller.id);
    const customer = await User.findOne({ _id: customerId, 'addedBy.phone': seller.contact });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found or not created by this seller' });
    }

    const now = new Date();
    const coupons = await Coupon.find({
      $and: [
        { $or: [ { isGlobal: true }, { userId: customerId }, { userPhone: customer.phone } ] },
        { isActive: true },
        { $or: [ { validUntil: null }, { validUntil: { $gte: now } } ] },
        { validFrom: { $lte: now } }
      ]
    }).select('_id code type value minOrderAmount maxDiscountAmount description userId userPhone isGlobal usageLimit');

    // Find coupons already used by this user in Orders (metadata.couponId)
    const usedCouponIds = await Order.distinct('metadata.couponId', {
      user: customer._id,
      'metadata.couponId': { $ne: null }
    });

    const usedSet = new Set((usedCouponIds || []).map(String));

    const filtered = coupons.filter(c => {
      if ((c.usageLimit || 1) === 1) {
        // Both global and user-specific coupons are checked per customer
        return !usedSet.has(String(c._id));
      }
      return true;
    });

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Get customer coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer coupons' });
  }
};

// Record sale - Send OTP
export const recordSaleSendOtp = async (req, res) => {
  try {
    const { customerId, items, couponId, coinsUsed = 0, total } = req.body;

    // Input validation
    if (!customerId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, items, and total are required',
        errors: {
          customerId: !customerId ? 'Customer ID is required' : null,
          items: (!items || !Array.isArray(items) || items.length === 0) ? 'At least one item is required' : null,
          total: !total ? 'Total amount is required' : null
        }
      });
    }

    // Validate total amount
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount must be a positive number',
        errors: { total: 'Invalid total amount' }
      });
    }

    // Validate coins used
    if (coinsUsed < 0) {
      return res.status(400).json({
        success: false,
        message: 'Coins used cannot be negative',
        errors: { coinsUsed: 'Invalid coins amount' }
      });
    }

    const seller = await Seller.findById(req.seller.id);
    if (!seller) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found',
        errors: { seller: 'Seller account not found' }
      });
    }

    const customer = await User.findOne({ _id: customerId, 'addedBy.phone': seller.contact });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found or not created by this seller',
        errors: { customer: 'Customer not found or unauthorized access' }
      });
    }

    // Validate items and stock
    const itemErrors = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.productId || !item.quantity || !item.price) {
        itemErrors.push(`Item ${i + 1}: Product ID, quantity, and price are required`);
        continue;
      }

      if (item.quantity <= 0) {
        itemErrors.push(`Item ${i + 1}: Quantity must be positive`);
        continue;
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        itemErrors.push(`Item ${i + 1}: Product not found`);
        continue;
      }

      if (!product.isActive) {
        itemErrors.push(`Item ${i + 1}: Product '${product.name}' is inactive`);
        continue;
      }

      if (product.inventory.stock < item.quantity) {
        itemErrors.push(`Item ${i + 1}: Insufficient stock for '${product.name}' (Available: ${product.inventory.stock}, Requested: ${item.quantity})`);
      }
    }

    if (itemErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items in sale',
        errors: { items: itemErrors }
      });
    }

    // Validate coupon if provided
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or inactive coupon',
          errors: { coupon: 'Coupon not found or inactive' }
        });
      }

      // Check coupon validity dates
      const now = new Date();
      if (coupon.validFrom && coupon.validFrom > now) {
        return res.status(400).json({
          success: false,
          message: 'Coupon is not yet valid',
          errors: { coupon: `Coupon valid from ${coupon.validFrom.toDateString()}` }
        });
      }

      if (coupon.validUntil && coupon.validUntil < now) {
        return res.status(400).json({
          success: false,
          message: 'Coupon has expired',
          errors: { coupon: `Coupon expired on ${coupon.validUntil.toDateString()}` }
        });
      }
    }

    // Validate coins
    if (coinsUsed > customer.rewardPoints) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient reward points',
        errors: { 
          coins: `Available: ${customer.rewardPoints}, Requested: ${coinsUsed}` 
        }
      });
    }

    const saleData = { 
      sellerId: req.seller.id, 
      customerId, 
      items, 
      couponId, 
      coinsUsed, 
      total, 
      timestamp: new Date() 
    };

    global.pendingSales = global.pendingSales || new Map();
    global.pendingSales.set(customer.phone, saleData);

    const otpRequest = { phone: customer.phone, name: customer.name, type: 'login' };
    const mockReq = { body: otpRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json({ success: code < 400, ...data })
      }),
      json: (data) => res.json({ success: true, ...data })
    };

    await sendOtp(mockReq, mockRes);
  } catch (error) {
    console.error('Record sale send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      errors: { server: 'Internal server error occurred' }
    });
  }
};

// Record sale - Verify OTP and complete order
export const recordSaleVerifyOtp = async (req, res) => {
  try {
    const { customerId, otp } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    global.pendingSales = global.pendingSales || new Map();
    const saleData = global.pendingSales.get(customer.phone);

    if (!saleData) {
      return res.status(400).json({ success: false, message: 'No pending sale found' });
    }

    const verifyRequest = { phone: customer.phone, otp, type: 'login' };

    let otpValid = false;
    const mockReq = { body: verifyRequest };
    const mockRes = {
      status: (code) => ({
        json: (data) => { otpValid = code < 400; return { status: code, data }; }
      }),
      json: (data) => { otpValid = true; return { status: 200, data }; }
    };

    try {
      await verifyOtp(mockReq, mockRes);
    } catch (error) {
      otpValid = false;
    }

    if (!otpValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of saleData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }

      product.inventory.stock -= item.quantity;
      await product.save();

      const image = (product.images && (product.images.primary || product.images[0])) || '';
      const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : product.price;
      const subtotalItem = item.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug || String(product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image,
        price: item.price,
        originalPrice,
        quantity: item.quantity,
        subtotal: subtotalItem
      });

      subtotal += item.price * item.quantity;
    }

    let couponDiscount = 0;
    if (saleData.couponId) {
      const coupon = await Coupon.findById(saleData.couponId);
      if (coupon) {
        // Enforce usage limits properly - both global and user-specific coupons are per-customer
        if ((coupon.usageLimit || 1) === 1) {
          const alreadyUsed = await Order.findOne({
            user: customerId,
            'metadata.couponId': String(saleData.couponId)
          });
          if (alreadyUsed) {
            return res.status(400).json({
              success: false,
              message: 'This coupon has already been used by this customer.'
            });
          }
        }
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

    const seller = await Seller.findById(saleData.sellerId);
    
    const order = new Order({
      orderNumber: `SO${Date.now()}${Math.floor(Math.random() * 1000)}`,
      user: customerId,
      items: orderItems,
      pricing: { subtotal, discount: couponDiscount + coinsDiscount, total: finalTotal },
      status: 'seller orders',
      payment: { method: 'cod', status: 'completed' },
      shippingAddress: {
        firstName: customer.name.split(' ')[0] || 'Customer',
        lastName: customer.name.split(' ').slice(1).join(' ') || 'Name',
        email: customer.email || 'customer@example.com',
        phone: customer.phone,
        addressLine1: 'Seller Store Purchase',
        city: 'Store Location',
        state: 'Store State',
        pincode: '000000'
      },
      rewards: { pointsEarned: 0, pointsUsed: saleData.coinsUsed || 0 },
      metadata: {
        sellerId: saleData.sellerId,
        sellerName: seller.name,
        couponUsed: saleData.couponId ? (await Coupon.findById(saleData.couponId)).code : null,
        couponId: saleData.couponId || null,
        coinsUsed: saleData.coinsUsed || 0
      }
    });

    // Do not manually mutate user points; Transactions will update balance

    // For seller orders, award points immediately: 10% of final total (after discounts/coins)
    const pointsEarned = Math.round(finalTotal * 0.1);
    // Do not manually mutate user points; create earning transaction below will credit points

    // Save points on order
    order.rewards.pointsEarned = pointsEarned;
    order.rewards.pointsUsed = saleData.coinsUsed || 0;
    await order.save();

    // Record coupon usage in transactions (for usage tracking in user transactions)
    if (couponDiscount > 0 && saleData.couponId) {
      const couponDoc = await Coupon.findById(saleData.couponId);
      if (couponDoc) {
        await Transaction.create({
          user: customerId,
          order: order._id,
          type: 'redeem',
          category: 'promotion',
          amount: couponDiscount,
          description: `Used coupon '${couponDoc.code}'`,
          reference: order.orderNumber,
          points: { redeemed: couponDiscount, balance: 0 },
          status: 'completed',
          metadata: { source: 'coupon', couponId: String(couponDoc._id), code: couponDoc.code }
        });
      }
    }

    if (saleData.coinsUsed > 0) {
      await Transaction.createRedemption({
        userId: customerId,
        orderId: order._id,
        category: 'points',
        amount: saleData.coinsUsed,
        points: saleData.coinsUsed,
        description: `Redeemed ${saleData.coinsUsed} points for ${order.orderNumber}`,
        source: 'purchase'
      });
    }

    if (pointsEarned > 0) {
      await Transaction.createEarning({
        userId: customerId,
        orderId: order._id,
        category: 'points',
        amount: pointsEarned,
        points: pointsEarned,
        description: `Earned ${pointsEarned} points for ${order.orderNumber}`,
        source: 'purchase'
      });
    }

    // Record purchase transaction for total amount (seller POS)
    await Transaction.create({
      user: customerId,
      order: order._id,
      type: 'purchase',
      category: 'purchase',
      amount: finalTotal,
      description: `Order placed (Seller POS) - ${order.orderNumber}`,
      reference: order.orderNumber,
      points: { balance: 0 },
      status: 'completed',
      metadata: { source: 'purchase' }
    });

    // Update seller's sales data using the new method
    const sellerToUpdate = await Seller.findById(saleData.sellerId);
    if (sellerToUpdate) {
      await sellerToUpdate.updateSalesData(finalTotal, order._id);
    }

    // Clean up pending sale
    global.pendingSales.delete(customer.phone);
     console.log('Sale completed successfully');
    res.json({ 
      success: true, 
      message: 'Sale completed successfully', 
      data: { 
        orderId: order._id, 
        orderNumber: order.orderNumber, 
        total: finalTotal, 
        pointsEarned,
        customer: {
          name: customer.name,
          phone: customer.phone,
          newRewardPoints: customer.rewardPoints
        }
      } 
    });
  } catch (error) {
    console.error('Record sale verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete sale',
      errors: { server: 'Internal server error occurred' }
    });
  }
};

// Get seller orders
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sellerId = req.seller.id;

    // Get seller with order IDs
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Build filter using seller's order IDs
    const filter = { _id: { $in: seller.orderIds || [] } };
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
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Get products for sellers (active products only)
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter - sellers can only see active products
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .select('name price originalPrice category images inventory.stock isActive')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.json({ 
      success: true, 
      data: { 
        products,
        pagination: { 
          current: parseInt(page), 
          pages: Math.ceil(totalProducts / parseInt(limit)), 
          total: totalProducts 
        }
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      errors: { server: 'Internal server error occurred' }
    });
  }
};
