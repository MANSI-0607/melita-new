import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    shortDescription: {
      type: String,
      maxlength: 200
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
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    category: {
      type: String,
      required: true,
      enum: ['cleanser', 'essence', 'moisturizer', 'sunscreen', 'combo', 'kit']
    },
    skinType: {
      type: [String],
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all']
    },
    images: {
      primary: {
        type: String,
        required: true
      },
      hover: String,
      gallery: [String],
      videos: [String]
    },

    // ✅ Benefits with image + text
    benefits: [
      {
        image: { type: String, required: true },
        text: { type: String, required: true }
      }
    ],

    // ✅ Ingredients with name, description, benefits
    ingredients: [
      {
        name: { type: String, required: true },
        description: { type: String },
        benefits: [String]
      }
    ],

    // ✅ FAQ section
    faq: [
      {
        title: { type: String, required: true },
        questions: [
          {
            question: { type: String, required: true },
            answer: { type: String, required: true }
          }
        ]
      }
    ],

 

    specifications: {
      volume: String,
      weight: String,
      spf: String,
      pa: String,
      skinType: [String],
      ageGroup: [String]
    },
    inventory: {
      stock: {
        type: Number,
        default: 0,
        min: 0
      },
      lowStockThreshold: {
        type: Number,
        default: 10
      },
      trackInventory: {
        type: Boolean,
        default: true
      }
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: [String],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice > 0) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (!this.inventory.trackInventory) return 'in-stock';
  if (this.inventory.stock === 0) return 'out-of-stock';
  if (this.inventory.stock <= this.inventory.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Pre-save middleware for discount calculation
productSchema.pre('save', function (next) {
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

// Static methods
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

productSchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, isActive: true }).sort({ createdAt: -1 });
};

productSchema.statics.searchProducts = function (query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ 'ratings.average': -1, createdAt: -1 });
};

const Product = mongoose.model('Product', productSchema);
export default Product;
