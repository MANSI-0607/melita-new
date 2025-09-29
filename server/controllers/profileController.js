import User from '../models/User.js';
import Address from '../models/Address.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, dateOfBirth, gender, preferences } = req.body;
    const userId = req.user._id;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const dashboardStats = await user.getDashboardStats();

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          loyaltyTier: user.loyaltyTier,
          rewardPoints: user.rewardPoints,
          profileCompletion: user.profileCompletion
        },
        ...dashboardStats
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Update password (if implementing password-based auth in future)
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // For now, since we're using OTP-based auth, this is a placeholder
    // In future, if you add password authentication, implement this:
    
    res.json({
      success: true,
      message: 'Password update feature not implemented yet'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Deactivate account instead of deleting for data integrity
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      phone: `deleted_${Date.now()}_${userId}` // Make phone unique
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Get referral data
export const getReferralData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('referralCode referralCount referredBy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get referred users
    const referredUsers = await User.find({ referredBy: user._id })
      .select('name phone createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referredUsers: referredUsers.map(u => ({
          name: u.name || 'Anonymous',
          phone: u.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'), // Mask phone
          joinedAt: u.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get referral data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral data'
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { newsletter, smsNotifications, pushNotifications } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (newsletter !== undefined) updateData['preferences.newsletter'] = newsletter;
    if (smsNotifications !== undefined) updateData['preferences.smsNotifications'] = smsNotifications;
    if (pushNotifications !== undefined) updateData['preferences.pushNotifications'] = pushNotifications;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.preferences
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

// Get loyalty information
export const getLoyaltyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('loyaltyTier rewardPoints totalSpent');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const loyaltyBenefits = user.loyaltyBenefits;
    const nextTier = getNextTier(user.loyaltyTier);
    const progressToNextTier = calculateProgressToNextTier(user.loyaltyTier, user.totalSpent);

    res.json({
      success: true,
      data: {
        currentTier: user.loyaltyTier,
        rewardPoints: user.rewardPoints,
        totalSpent: user.totalSpent,
        benefits: loyaltyBenefits,
        nextTier,
        progressToNextTier
      }
    });

  } catch (error) {
    console.error('Get loyalty info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty information'
    });
  }
};

// Helper functions
function getNextTier(currentTier) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function calculateProgressToNextTier(currentTier, totalSpent) {
  const tierThresholds = {
    bronze: 0,
    silver: 10000,
    gold: 25000,
    platinum: 50000
  };

  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;

  const currentThreshold = tierThresholds[currentTier];
  const nextThreshold = tierThresholds[nextTier];
  const progress = ((totalSpent - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return {
    current: totalSpent - currentThreshold,
    required: nextThreshold - currentThreshold,
    percentage: Math.min(Math.max(progress, 0), 100)
  };
}
