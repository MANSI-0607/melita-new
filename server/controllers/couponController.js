import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

// Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const coupons = await Coupon.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Coupon.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// Get single coupon by ID (Admin only)
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id).populate('userId', 'name email');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Get coupon by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon'
    });
  }
};

// Create new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      userId,
      isGlobal,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      description
    } = req.body;
    
    // Validate required fields
    if (!code || !type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Code, type, and value are required'
      });
    }
    
    // Validate type and value
    if (!['fixed', 'percentage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "fixed" or "percentage"'
      });
    }
    
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100'
      });
    }
    
    if (value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Value must be positive'
      });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    // If userId is provided, validate user exists
    if (userId && !isGlobal) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
    }
    
    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      userId: isGlobal ? null : userId,
      isGlobal: isGlobal || false,
      usageLimit: usageLimit || 1,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      description
    });
    
    await coupon.save();
    
    // Populate user data for response
    await coupon.populate('userId', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      userId,
      isGlobal,
      isActive,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      description
    } = req.body;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    // Validate type and value if provided
    if (type && !['fixed', 'percentage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "fixed" or "percentage"'
      });
    }
    
    if (value !== undefined) {
      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Value must be positive'
        });
      }
      
      if ((type || coupon.type) === 'percentage' && (value < 0 || value > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Percentage value must be between 0 and 100'
        });
      }
    }
    
    // Check if new coupon code already exists (if code is being changed)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }
    
    // If userId is provided, validate user exists
    if (userId && !isGlobal) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
    }
    
    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (userId !== undefined) coupon.userId = isGlobal ? null : userId;
    if (isGlobal !== undefined) coupon.isGlobal = isGlobal;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (description !== undefined) coupon.description = description;
    
    await coupon.save();
    
    // Populate user data for response
    await coupon.populate('userId', 'name email');
    
    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    await Coupon.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// Toggle coupon status (Admin only)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Toggle coupon status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status'
    });
  }
};

// Validate coupon (Public - for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, userId, orderAmount } = req.body;
    
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
    if (!coupon.isGlobal && coupon.userId && coupon.userId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not valid for your account'
      });
    }
    
    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
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
    
    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon: {
          id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description
        },
        discountAmount: Math.round(discountAmount * 100) / 100
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
