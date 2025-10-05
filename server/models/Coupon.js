import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for global coupons
  },
  userPhone: {
    type: String,
    default: null, // For linking coupons to specific phone numbers
    trim: true
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: 1, // 1 = one-time use, 0 = unlimited
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ userId: 1, isActive: 1 });
couponSchema.index({ userPhone: 1, isActive: 1 });
couponSchema.index({ isGlobal: 1, isActive: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
