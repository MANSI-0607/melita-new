import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Get user's reward points balance
export const getRewardBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('rewardPoints loyaltyTier totalSpent');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        rewardPoints: user.rewardPoints,
        loyaltyTier: user.loyaltyTier,
        totalSpent: user.totalSpent,
        pointsValue: user.rewardPoints, // 1 point = ₹1
        nextTierThreshold: getNextTierThreshold(user.loyaltyTier)
      }
    });

  } catch (error) {
    console.error('Get reward balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reward balance'
    });
  }
};

// Get user's transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const options = {
      type,
      category,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const transactions = await Transaction.findByUser(userId, options);
    const total = await Transaction.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
};

// Get reward summary
export const getRewardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Transaction.getRewardSummary(userId);

    res.json({
      success: true,
      data: summary[0] || {
        totalEarned: 0,
        totalRedeemed: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        transactionCount: 0,
        lastTransaction: null
      }
    });

  } catch (error) {
    console.error('Get reward summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reward summary'
    });
  }
};

// Redeem reward points
export const redeemPoints = async (req, res) => {
  try {
    const { points, orderId } = req.body;
    const userId = req.user._id;

    // Validate points
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has enough points
    if (user.rewardPoints < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient reward points'
      });
    }

    // Check minimum redemption amount (e.g., 100 points minimum)
    if (points < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum redemption amount is 100 points'
      });
    }

    // Deduct points
    user.rewardPoints -= points;
    await user.save();

    // Create redemption transaction
    const transaction = await Transaction.createRedemption({
      userId,
      orderId,
      category: 'purchase',
      amount: points,
      points,
      description: `Redeemed ${points} reward points`,
      reference: orderId ? `Order ${orderId}` : 'Manual redemption',
      source: orderId ? 'purchase' : 'manual'
    });

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      data: {
        transaction,
        newBalance: user.rewardPoints
      }
    });

  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to redeem points'
    });
  }
};

// Get earning opportunities
export const getEarningOpportunities = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const opportunities = [
      {
        id: 'purchase',
        title: 'Make a Purchase',
        description: 'Earn 1 point for every ₹1 spent',
        points: 'Variable',
        icon: '🛍️',
        completed: false
      },
      {
        id: 'referral',
        title: 'Refer a Friend',
        description: 'Earn 500 points when your friend makes their first purchase',
        points: '500',
        icon: '👥',
        completed: false
      },
      {
        id: 'review',
        title: 'Write a Product Review',
        description: 'Earn 50 points for each verified product review',
        points: '50',
        icon: '⭐',
        completed: false
      },
      {
        id: 'birthday',
        title: 'Birthday Bonus',
        description: 'Earn 1000 points on your birthday (if date added)',
        points: '1000',
        icon: '🎂',
        completed: !user.dateOfBirth
      }
    ];

    res.json({
      success: true,
      data: opportunities
    });

  } catch (error) {
    console.error('Get earning opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earning opportunities'
    });
  }
};

// Award referral bonus
export const awardReferralBonus = async (req, res) => {
  try {
    const { referredUserId } = req.body;
    const referrerId = req.user._id;

    // Check if referrer exists
    const referrer = await User.findById(referrerId);
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Referrer not found'
      });
    }

    // Check if referred user exists and was referred by this user
    const referredUser = await User.findById(referredUserId);
    if (!referredUser || referredUser.referredBy.toString() !== referrerId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referral relationship'
      });
    }

    // Check if bonus already awarded
    const existingTransaction = await Transaction.findOne({
      user: referrerId,
      type: 'earn',
      category: 'referral',
      'metadata.source': 'referral',
      reference: referredUserId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Referral bonus already awarded'
      });
    }

    // Award bonus to referrer
    const referrerBonus = 500;
    referrer.rewardPoints += referrerBonus;
    referrer.referralCount += 1;
    await referrer.save();

    // Create transaction for referrer
    await Transaction.createEarning({
      userId: referrerId,
      category: 'referral',
      amount: referrerBonus,
      points: referrerBonus,
      description: `Referral bonus for ${referredUser.name || 'new user'}`,
      reference: referredUserId,
      source: 'referral'
    });

    // Award welcome bonus to referred user
    const welcomeBonus = 200;
    referredUser.rewardPoints += welcomeBonus;
    await referredUser.save();

    // Create transaction for referred user
    await Transaction.createEarning({
      userId: referredUserId,
      category: 'referral',
      amount: welcomeBonus,
      points: welcomeBonus,
      description: 'Welcome bonus for joining via referral',
      reference: referrerId,
      source: 'referral'
    });

    res.json({
      success: true,
      message: 'Referral bonus awarded successfully',
      data: {
        referrerBonus,
        welcomeBonus,
        newReferrerBalance: referrer.rewardPoints
      }
    });

  } catch (error) {
    console.error('Award referral bonus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award referral bonus'
    });
  }
};

// Award review bonus
export const awardReviewBonus = async (req, res) => {
  try {
    const { orderId, productId, reviewId } = req.body;
    const userId = req.user._id;

    // Verify order belongs to user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order for review bonus'
      });
    }

    // Check if review bonus already awarded
    const existingTransaction = await Transaction.findOne({
      user: userId,
      type: 'earn',
      category: 'review',
      reference: reviewId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Review bonus already awarded'
      });
    }

    // Award review bonus
    const reviewBonus = 50;
    const user = await User.findById(userId);
    user.rewardPoints += reviewBonus;
    await user.save();

    // Create transaction
    await Transaction.createEarning({
      userId,
      category: 'review',
      amount: reviewBonus,
      points: reviewBonus,
      description: 'Product review bonus',
      reference: reviewId,
      source: 'review'
    });

    res.json({
      success: true,
      message: 'Review bonus awarded successfully',
      data: {
        bonus: reviewBonus,
        newBalance: user.rewardPoints
      }
    });

  } catch (error) {
    console.error('Award review bonus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award review bonus'
    });
  }
};

// Helper function
function getNextTierThreshold(currentTier) {
  const thresholds = {
    bronze: 10000,
    silver: 25000,
    gold: 50000,
    platinum: null
  };
  return thresholds[currentTier];
}
