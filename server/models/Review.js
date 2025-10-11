import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional to allow admin-created reviews without a user
    },
    userName: {
      type: String,
      required: function() { return !this.user; }, // Require a name if no user is linked
      trim: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false // Not all reviews need to be from orders
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    customDate: {
      type: Date,
      default: null // If null, will use createdAt for display
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: ''
      }
    }],
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderationNotes: {
      type: String,
      trim: true
    },
    // Review metadata
    metadata: {
      ipAddress: String,
      userAgent: String,
      device: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }); // Unique constraint

// Virtual for review date display
reviewSchema.virtual('dateDisplay').get(function() {
  const displayDate = this.customDate || this.createdAt;
  return displayDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
});

// Virtual for user initials
reviewSchema.virtual('userInitials').get(function() {
  const name = this.userName || (this.user && this.user.name);
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  return 'U';
});

// Pre-save middleware to check for duplicate reviews
reviewSchema.pre('save', async function(next) {
  if (this.isNew && this.user) { // Only check for duplicates if user exists
    // Check if user already reviewed this product
    const existingReview = await this.constructor.findOne({
      product: this.product,
      user: this.user
    });
    
    if (existingReview) {
      const error = new Error('You have already reviewed this product');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update product ratings
reviewSchema.post('save', async function() {
  // Update ratings whenever a review is saved (status change triggers this)
  await this.constructor.updateProductRatings(this.product);
});

// Post-remove middleware to update product ratings
reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRatings(this.product);
});

// Static method to update product ratings
reviewSchema.statics.updateProductRatings = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
};

// Static method to get product reviews
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const { page = 1, limit = 10, rating, sort = 'createdAt', order = 'desc' } = options;
  
  const filter = { 
    product: productId, 
    status: 'approved' 
  };
  
  if (rating) {
    filter.rating = rating;
  }
  
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;
  
  return this.find(filter)
    .populate('user', 'name phone')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-metadata -moderationNotes');
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({ user: userId })
    .populate('product', 'name slug images.primary')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-metadata');
};

// Static method to mark review as helpful
reviewSchema.statics.markHelpful = async function(reviewId, userId) {
  const review = await this.findById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }
  
  const userIndex = review.helpful.users.indexOf(userId);
  if (userIndex > -1) {
    // Remove helpful vote
    review.helpful.users.splice(userIndex, 1);
    review.helpful.count -= 1;
  } else {
    // Add helpful vote
    review.helpful.users.push(userId);
    review.helpful.count += 1;
  }
  
  return review.save();
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = function(productId) {
  return this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          five: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } },
          four: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          three: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          two: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          one: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } }
        }
      }
    }
  ]);
};

const Review = mongoose.model('Review', reviewSchema);
export default Review;
