import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false // Not all transactions are order-related
    },
    type: {
      type: String,
      enum: ['earn', 'redeem', 'expire', 'refund', 'purchase'],
      required: true
    },
    category: {
      type: String,
      enum: ['purchase','referral', 'promotion', 'cashback', 'points'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD']
    },
    points: {
      earned: {
        type: Number,
        default: 0,
        min: 0
      },
      redeemed: {
        type: Number,
        default: 0,
        min: 0
      },
      balance: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    description: {
      type: String,
      required: true,
      maxlength: 200
    },
    reference: {
      type: String,
      required: false // For external reference like payment ID, order number
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'expired'],
      default: 'completed'
    },
    metadata: {
      source: {
        type: String,
        enum: ['purchase', 'referral', 'review', 'signup', 'bonus', 'admin', 'system', 'coupon'],
        required: true
      },
      campaignId: String,
      promotionCode: String,
      multiplier: {
        type: Number,
        default: 1,
        min: 0
      },
      originalAmount: Number,
      discountApplied: Number,
      // Coupon tracking
      couponId: {
        type: String,
        required: false
      },
      code: {
        type: String,
        required: false
      }
    },
    expiresAt: {
      type: Date,
      required: false // For points that expire
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ expiresAt: 1 });
// For one-time coupon usage checks
transactionSchema.index({ user: 1, 'metadata.couponId': 1 });

// Virtual for transaction display
transactionSchema.virtual('displayAmount').get(function() {
  if (this.type === 'earn') {
    return `+₹${this.amount}`;
  } else if (this.type === 'redeem') {
    return `-₹${this.amount}`;
  } else if (this.type === 'expire') {
    return `-${this.points.redeemed} points`;
  }
  return `₹${this.amount}`;
});

// Virtual for points display
transactionSchema.virtual('displayPoints').get(function() {
  if (this.points.earned > 0) {
    return `+${this.points.earned} points`;
  } else if (this.points.redeemed > 0) {
    return `-${this.points.redeemed} points`;
  }
  return `${this.points.balance} points`;
});

// Pre-save middleware to calculate points balance
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get user's current points balance
    const user = await mongoose.model('User').findById(this.user);
    if (user) {
      const currentBalance = user.rewardPoints || 0;
      
      // Calculate new balance based on transaction type
      if (this.type === 'earn') {
        this.points.balance = currentBalance + this.points.earned;
      } else if (this.type === 'redeem') {
        this.points.balance = Math.max(0, currentBalance - this.points.redeemed);
      } else if (this.type === 'expire') {
        this.points.balance = Math.max(0, currentBalance - this.points.redeemed);
      } else {
        this.points.balance = currentBalance;
      }
      
      // Update user's reward points
      await mongoose.model('User').findByIdAndUpdate(
        this.user,
        { $set: { rewardPoints: this.points.balance } }
      );
    }
  }
  next();
});

// Static method to get user's transaction history
transactionSchema.statics.findByUser = function(userId, options = {}) {
  const { type, category, excludeType, limit = 50, skip = 0 } = options;

  const query = { user: userId };
  if (type) query.type = type;
  if (excludeType) query.type = { ...(query.type || {}), $ne: excludeType };
  if (category) query.category = category;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('order', 'orderNumber status');
};

// Static method to get user's reward summary
transactionSchema.statics.getRewardSummary = function(userId) {
  const userObjectId = (userId && userId._id) ? userId._id : userId;
  const uid = userObjectId instanceof mongoose.Types.ObjectId
    ? userObjectId
    : new mongoose.Types.ObjectId(String(userObjectId));

  return this.aggregate([
    { $match: { user: uid } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'earn'] }, '$amount', 0] }
        },
        totalRedeemed: {
          $sum: { $cond: [{ $eq: ['$type', 'redeem'] }, '$amount', 0] }
        },
        totalPointsEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'earn'] }, '$points.earned', 0] }
        },
        totalPointsRedeemed: {
          $sum: { $cond: [{ $eq: ['$type', 'redeem'] }, '$points.redeemed', 0] }
        },
        transactionCount: { $sum: 1 },
        lastTransaction: { $max: '$createdAt' }
      }
    }
  ]);
};

// Static method to create earning transaction
transactionSchema.statics.createEarning = function(data) {
  return this.create({
    user: data.userId,
    order: data.orderId,
    type: 'earn',
    category: data.category,
    amount: data.amount,
    points: {
      earned: data.points,
      balance: 0 // Will be calculated in pre-save
    },
    description: data.description,
    reference: data.reference,
    metadata: {
      source: data.source,
      campaignId: data.campaignId,
      promotionCode: data.promotionCode,
      multiplier: data.multiplier || 1
    }
  });
};

// Static method to create redemption transaction
transactionSchema.statics.createRedemption = function(data) {
  return this.create({
    user: data.userId,
    order: data.orderId,
    type: 'redeem',
    category: data.category,
    amount: data.amount,
    points: {
      redeemed: data.points,
      balance: 0 // Will be calculated in pre-save
    },
    description: data.description,
    reference: data.reference,
    metadata: {
      source: data.source
    }
  });
};

// Static method to expire points
transactionSchema.statics.expirePoints = function(userId, pointsToExpire, description) {
  return this.create({
    user: userId,
    type: 'expire',
    category: 'points',
    amount: 0,
    points: {
      redeemed: pointsToExpire,
      balance: 0 // Will be calculated in pre-save
    },
    description: description || 'Points expired',
    metadata: {
      source: 'system'
    }
  });
};

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
