import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

// Get eligible coupons for a user (Public - for checkout list)
export const getEligibleCoupons = async (req, res) => {
  try {
    const { userId, phone, orderAmount } = req.query;

    let user = null;
    if (userId) {
      user = await User.findById(userId).select('phone');
    } else if (phone) {
      user = await User.findOne({ phone }).select('phone');
    }

    // If no user found and no global coupons desired, we still return global coupons
    const now = new Date();

    const orConditions = [{ isGlobal: true }];
    if (user) {
      orConditions.push({ userId: user._id });
      if (user.phone) orConditions.push({ userPhone: user.phone });
    }

    const coupons = await Coupon.find({
      isActive: true,
      $and: [
        { $or: orConditions },
        { $or: [ { validUntil: null }, { validUntil: { $gte: now } } ] },
        { validFrom: { $lte: now } }
      ]
    }).sort({ createdAt: -1 });

    // Get used coupons for this user if user exists
    let usedCouponIds = [];
    if (user) {
      const Order = (await import('../models/Order.js')).default;
      usedCouponIds = await Order.distinct('metadata.couponId', {
        user: user._id,
        'metadata.couponId': { $ne: null }
      });
    }
    const usedSet = new Set((usedCouponIds || []).map(String));

    // Filter by min order amount and usage limits
    const filtered = coupons.filter(c => {
      if (orderAmount !== undefined) {
        const amt = Number(orderAmount);
        if (!isNaN(amt) && c.minOrderAmount && amt < c.minOrderAmount) return false;
      }
      
      // Check usage limits - both global and user-specific coupons are per-customer
      if ((c.usageLimit || 1) === 1 && user) {
        return !usedSet.has(String(c._id));
      }
      
      return true;
    }).map(c => ({
      id: c._id,
      code: c.code,
      type: c.type,
      value: c.value,
      description: c.description,
      isGlobal: c.isGlobal,
      minOrderAmount: c.minOrderAmount,
      maxDiscountAmount: c.maxDiscountAmount,
      validFrom: c.validFrom,
      validUntil: c.validUntil
    }));

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Get eligible coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch eligible coupons' });
  }
};

// Validate coupon (Public - for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, userId, phone, orderAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    // Check if coupon is expired
    const now = new Date();
    if (coupon.validUntil && coupon.validUntil < now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }
    
    if (coupon.validFrom > now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet valid'
      });
    }
    
    // Check if coupon is user-specific
    if (!coupon.isGlobal) {
      let isValidForUser = false;
      
      // Check by userId
      if (userId && coupon.userId && coupon.userId.toString() === userId) {
        isValidForUser = true;
      }
      
      // Check by phone
      if (phone && coupon.userPhone && coupon.userPhone === phone) {
        isValidForUser = true;
      }
      
      // If user-specific but no match found
      if (!isValidForUser) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not valid for your account'
        });
      }
    }
    
    // Check minimum order amount
    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Check usage limits - both global and user-specific coupons are per-customer
    if ((coupon.usageLimit || 1) === 1 && (userId || phone)) {
      const Order = (await import('../models/Order.js')).default;
      let user = null;
      
      if (userId) {
        user = await User.findById(userId);
      } else if (phone) {
        user = await User.findOne({ phone });
      }
      
      if (user) {
        const alreadyUsed = await Order.findOne({
          user: user._id,
          'metadata.couponId': String(coupon._id)
        });
        
        if (alreadyUsed) {
          return res.status(400).json({
            success: false,
            message: 'This coupon has already been used by this customer.'
          });
        }
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (orderAmount) {
      if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      } else if (coupon.type === 'percentage') {
        discountAmount = (orderAmount * coupon.value) / 100;
      }
      
      // Apply maximum discount limit
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
      
      // Ensure discount doesn't exceed order amount
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    }
    
    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon: {
          id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscountAmount: coupon.maxDiscountAmount
        },
        discountAmount: orderAmount ? Math.round(discountAmount * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
};

// Get coupon statistics (Admin only)
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ 
      validUntil: { $lt: new Date() },
      isActive: true
    });
    const globalCoupons = await Coupon.countDocuments({ isGlobal: true });
    const userSpecificCoupons = await Coupon.countDocuments({ isGlobal: false });
    
    res.json({
      success: true,
      data: {
        total: totalCoupons,
        active: activeCoupons,
        inactive: totalCoupons - activeCoupons,
        expired: expiredCoupons,
        global: globalCoupons,
        userSpecific: userSpecificCoupons
      }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics'
    });
  }
};
