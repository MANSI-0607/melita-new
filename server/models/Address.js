import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  addressline1: {
    type: String,
    required: true,
    trim: true
  },
  addressline2: {
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
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
addressSchema.index({ user: 1, isActive: 1, isDefault: 1 });
addressSchema.index({ pincode: 1 });

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isModified('isDefault') && this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Instance methods
addressSchema.methods.formatForShipping = function() {
  return {
    firstName: this.first_name,
    lastName: this.last_name,
    email: this.email,
    phone: this.phone,
    addressLine1: this.addressline1,
    addressLine2: this.addressline2 || '',
    state: this.state,
    pincode: this.pincode,
    country: 'India'
  };
};

// Static helpers
addressSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ isDefault: -1, updatedAt: -1 });
};

addressSchema.statics.findDefaultByUser = function(userId) {
  return this.findOne({ user: userId, isActive: true, isDefault: true });
};

addressSchema.statics.validatePincode = function(pincode) {
  // Simple 6-digit Indian pincode validation
  return /^[1-9][0-9]{5}$/.test(String(pincode));
};

const Address = mongoose.model('Address', addressSchema);
export default Address;