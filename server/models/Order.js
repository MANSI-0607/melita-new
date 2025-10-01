import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    billingAddress: {
      type: shippingAddressSchema,
      default: function() {
        return this.shippingAddress;
      }
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0
      },
      discount: {
        type: Number,
        default: 0,
        min: 0
      },
      rewardPointsUsed: {
        type: Number,
        default: 0,
        min: 0
      },
      shipping: {
        type: Number,
        default: 0,
        min: 0
      },
      tax: {
        type: Number,
        default: 0,
        min: 0
      },
      total: {
        type: Number,
        required: true,
        min: 0
      }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    payment: {
      method: {
        type: String,
        enum: ['cod', 'online', 'wallet'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      transactionId: String,
      razorpayPaymentId: String,
      razorpayOrderId: String,
      razorpaySignature: String,
      gatewayResponse: mongoose.Schema.Types.Mixed
    },
    shipping: {
      method: {
        type: String,
        enum: ['standard', 'express', 'overnight'],
        default: 'standard'
      },
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date,
      actualDelivery: Date
    },
    rewards: {
      pointsEarned: {
        type: Number,
        default: 0,
        min: 0
      },
      pointsUsed: {
        type: Number,
        default: 0,
        min: 0
      },
      cashbackEarned: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    notes: {
      customer: String,
      internal: String
    },
    timeline: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Order Placed',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for estimated delivery
orderSchema.virtual('estimatedDeliveryDate').get(function() {
  if (this.shipping.estimatedDelivery) {
    return this.shipping.estimatedDelivery;
  }
  
  // Calculate estimated delivery based on shipping method
  const deliveryDays = {
    'standard': 5,
    'express': 2,
    'overnight': 1
  };
  
  const days = deliveryDays[this.shipping.method] || 5;
  const deliveryDate = new Date(this.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  
  return deliveryDate;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.orderNumber) {
      const count = await this.constructor.countDocuments();
      const timestamp = Date.now().toString().slice(-6);
      this.orderNumber = `MLT${timestamp}${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Add timeline entry for status changes
    if (this.isModified('status') && !this.isNew) {
      this.timeline.push({
        status: this.status,
        timestamp: new Date(),
        note: `Order status changed to ${this.statusDisplay}`
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getStats = function(userId = null) {
  const match = userId ? { user: userId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
