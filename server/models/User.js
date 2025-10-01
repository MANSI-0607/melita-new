import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { 
      type: String, 
      trim: true, 
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    dateOfBirth: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer_not_to_say'] 
    },
    // OTP fields
    otpCode: { type: String },
    otpExpires: { type: Date },
    // Rate limiting / security fields
    lastOtpSentAt: { type: Date },
    otpSendWindowStart: { type: Date }, // start of rolling window for send counts
    otpSendCount: { type: Number, default: 0 }, // number of OTPs sent in window
    otpVerifyWindowStart: { type: Date }, // start of rolling window for verify attempts
    otpVerifyAttempts: { type: Number, default: 0 }, // number of verify attempts in window
    // Account status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    // Rewards and loyalty
    rewardPoints: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    totalSpent: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    loyaltyTier: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'], 
      default: 'bronze' 
    },
    // Preferences
    preferences: {
      skinType: { 
        type: String, 
        enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'] 
      },
      ageGroup: { 
        type: String, 
        enum: ['18-25', '26-35', '36-45', '46-55', '55+'] 
      },
      skinConcerns: [{ 
        type: String, 
        enum: ['acne', 'aging', 'dark_spots', 'dryness', 'oiliness', 'sensitivity', 'uneven_tone'] 
      }],
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true }
    },
    // Social and referral
    referralCode: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    referredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    referralCount: { 
      type: Number, 
      default: 0 
    },
    // Profile completion
    profileCompletion: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    // Last activity tracking
    lastLoginAt: { type: Date },
    lastOrderAt: { type: Date },
    // Addresses and orders
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ loyaltyTier: 1 });
userSchema.index({ addresses: 1 });
userSchema.index({ orderHistory: 1 });

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name || `User ${this.phone.slice(-4)}`;
});

// Virtual alias for points (mirror of rewardPoints)
userSchema.virtual('points').get(function() {
  return this.rewardPoints || 0;
});

// Virtual for loyalty tier benefits
userSchema.virtual('loyaltyBenefits').get(function() {
  const benefits = {
    bronze: { discount: 0, pointsMultiplier: 1, freeShipping: false },
    silver: { discount: 5, pointsMultiplier: 1.2, freeShipping: false },
    gold: { discount: 10, pointsMultiplier: 1.5, freeShipping: true },
    platinum: { discount: 15, pointsMultiplier: 2, freeShipping: true }
  };
  return benefits[this.loyaltyTier] || benefits.bronze;
});

// Pre-save middleware to generate referral code
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    // Generate unique referral code
    let referralCode;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = this.name ? 
        this.name.substring(0, 3).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase() :
        'MLT' + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const existing = await this.constructor.findOne({ referralCode });
      isUnique = !existing;
    }
    
    this.referralCode = referralCode;
  }
  
  // Calculate profile completion
  let completion = 0;
  if (this.name) completion += 20;
  if (this.email) completion += 20;
  if (this.dateOfBirth) completion += 10;
  if (this.gender) completion += 10;
  if (this.preferences.skinType) completion += 20;
  if (this.preferences.ageGroup) completion += 10;
  if (this.preferences.skinConcerns && this.preferences.skinConcerns.length > 0) completion += 10;
  
  this.profileCompletion = completion;
  
  next();
});

// Static method to find user by referral code
userSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ referralCode, isActive: true });
};

// Static method to update loyalty tier
userSchema.statics.updateLoyaltyTier = function(userId) {
  return this.findById(userId).then(user => {
    if (!user) return null;
    
    const spent = user.totalSpent;
    let newTier = 'bronze';
    
    if (spent >= 50000) newTier = 'platinum';
    else if (spent >= 25000) newTier = 'gold';
    else if (spent >= 10000) newTier = 'silver';
    
    if (user.loyaltyTier !== newTier) {
      user.loyaltyTier = newTier;
      return user.save();
    }
    
    return user;
  });
};

// Instance method to add reward points
userSchema.methods.addRewardPoints = function(points, description) {
  this.rewardPoints += points;
  return this.save();
};

// Instance method to redeem reward points
userSchema.methods.redeemRewardPoints = function(points) {
  if (this.rewardPoints >= points) {
    this.rewardPoints -= points;
    return this.save();
  }
  throw new Error('Insufficient reward points');
};

// Instance method to update total spent
userSchema.methods.updateTotalSpent = function(amount) {
  this.totalSpent += amount;
  this.lastOrderAt = new Date();
  return this.save();
};

// Instance method to get dashboard stats
userSchema.methods.getDashboardStats = async function() {
  const Order = mongoose.model('Order');
  const Address = mongoose.model('Address');
  const Transaction = mongoose.model('Transaction');
  
  const [orderStats, addressCount, transactionStats] = await Promise.all([
    Order.aggregate([
      { $match: { user: this._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]),
    Address.countDocuments({ user: this._id, isActive: true }),
    Transaction.getRewardSummary(this._id)
  ]);
  
  return {
    orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrder: null },
    addresses: addressCount,
    rewards: transactionStats[0] || { 
      totalEarned: 0, 
      totalRedeemed: 0, 
      totalPointsEarned: 0, 
      totalPointsRedeemed: 0 
    },
    loyaltyTier: this.loyaltyTier,
    rewardPoints: this.rewardPoints,
    profileCompletion: this.profileCompletion
  };
};

const User = mongoose.model('User', userSchema);
export default User;
