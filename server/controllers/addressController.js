import Address from '../models/Address.js';

// Get user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.findByUser(userId);

    res.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses'
    });
  }
};

// Get default address
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const address = await Address.findDefaultByUser(userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default address'
    });
  }
};

// Create new address
export const createAddress = async (req, res) => {
  try {
    console.log("fg",req.user);
    const userId = req.user._id
    console.log("fg",userId);
    console.log('Creating address for user:', userId);
    console.log('Address data received:', req.body);
    
    const addressData = {
      ...req.body,
      user: userId
    };

    // Validate pincode
    if (!Address.validatePincode(addressData.pincode)) {
      console.log('Pincode validation failed for:', addressData.pincode);
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Please enter a valid 6-digit Indian pincode.'
      });
    }

    const address = new Address(addressData);
    await address.save();

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });

  } catch (error) {
    console.error('Create address error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Validate pincode if provided
    if (updateData.pincode && !Address.validatePincode(updateData.pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });

  } catch (error) {
    console.error('Update address error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // This will automatically unset other default addresses due to pre-save middleware
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address'
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({
      _id: addressId,
      user: userId
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Soft delete by setting isActive to false
    address.isActive = false;
    await address.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

// Get single address
export const getAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

// Validate pincode
export const validatePincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    const isValid = Address.validatePincode(pincode);

    res.json({
      success: true,
      data: {
        pincode,
        isValid
      }
    });

  } catch (error) {
    console.error('Validate pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate pincode'
    });
  }
};

// Get address suggestions (for autocomplete)
export const getAddressSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters'
      });
    }

    // This would typically integrate with a mapping service like Google Maps API
    // For now, return a simple response
    const suggestions = [
      {
        address: `${query}, Mumbai, Maharashtra`,
        pincode: '400001',
        city: 'Mumbai',
        state: 'Maharashtra'
      }
    ];

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Get address suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address suggestions'
    });
  }
};
