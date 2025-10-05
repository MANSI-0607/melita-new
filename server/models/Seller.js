import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        // Indian phone number validation (10 digits, starts with 6-9)
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Contact number must be a valid 10-digit Indian mobile number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
sellerSchema.index({ contact: 1 });

// Hash password before saving
sellerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
sellerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find active sellers
sellerSchema.statics.findActive = function() {
  return this.find({ status: 'active', isActive: true });
};

// Static method to find sellers by contact
sellerSchema.statics.findByContact = function(contact) {
  return this.findOne({ contact });
};

// Virtual for formatted joined date
sellerSchema.virtual('formattedJoinedAt').get(function() {
  return this.joinedAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Remove password from JSON output
sellerSchema.methods.toJSON = function() {
  const sellerObject = this.toObject();
  delete sellerObject.password;
  return sellerObject;
};

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
