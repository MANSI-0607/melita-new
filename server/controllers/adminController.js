import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';

// Admin credentials (in production, store in database with hashed password)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate admin token
    const token = jwt.sign(
      { 
        username: username,
        isAdmin: true,
        loginTime: new Date()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        username,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true })
    ]);

    // Get orders today
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfDay }
    });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name phone')
      .select('orderNumber pricing status createdAt user');

    // Get orders per day for the last 7 days
    const ordersPerDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          orders: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing days with 0 orders
    const ordersPerDayComplete = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const dayData = ordersPerDay.find(d => d.date === dateString);
      ordersPerDayComplete.push({
        date: dateString,
        orders: dayData ? dayData.orders : 0
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        ordersToday,
        recentOrders,
        ordersPerDay: ordersPerDayComplete
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats'
    });
  }
};

// Get users with pagination
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get orders with pagination
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get products with pagination and filters
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Increased limit for admin
    const skip = (page - 1) * limit;
    const { category, search, status = 'all' } = req.query;

    // Build filter
    const filter = {};
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;
    
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get reviews with pagination
export const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        phone: `deleted_${Date.now()}_${userId}` // Make phone unique
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// ===== ADDITIONAL ADMIN FUNCTIONS =====

// Get single product details
export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Toggle product status
export const toggleProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      data: product,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status'
    });
  }
};

// Get single order details
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'name phone email')
      .populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Get transactions with pagination
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, category, userId } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (userId) filter.user = userId;

    const transactions = await Transaction.find(filter)
      .populate('user', 'name phone email')
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Get single transaction details
export const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findById(transactionId)
      .populate('user', 'name phone email rewardPoints')
      .populate('order', 'orderNumber status pricing');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via admin
    delete updateData.otpCode;
    delete updateData.otpExpires;
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Get single user details
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order stats
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);

    // Get user's transaction stats
    const transactionStats = await Transaction.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalEarned: { $sum: { $cond: [{ $eq: ['$type', 'earn'] }, '$amount', 0] } },
          totalRedeemed: { $sum: { $cond: [{ $eq: ['$type', 'redeem'] }, '$amount', 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          orders: orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrder: null },
          transactions: transactionStats[0] || { totalTransactions: 0, totalEarned: 0, totalRedeemed: 0 }
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Award points to user
export const awardPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, description, category = 'bonus' } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create transaction
    await Transaction.createEarning({
      userId: userId,
      category: category,
      amount: points,
      points: points,
      description: description || `Admin awarded ${points} points`,
      source: 'admin'
    });

    res.json({
      success: true,
      message: `Successfully awarded ${points} points to user`
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
};

// Deduct points from user
export const deductPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, description, category = 'penalty' } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.rewardPoints < points) {
      return res.status(400).json({
        success: false,
        message: 'User does not have enough points'
      });
    }

    // Create transaction
    await Transaction.createRedemption({
      userId: userId,
      category: category,
      amount: points,
      points: points,
      description: description || `Admin deducted ${points} points`,
      source: 'admin'
    });

    res.json({
      success: true,
      message: `Successfully deducted ${points} points from user`
    });

  } catch (error) {
    console.error('Deduct points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deduct points'
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Generate slug from name if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Ensure required fields have defaults
    if (!productData.inventory) {
      productData.inventory = {
        stock: 0,
        lowStockThreshold: 10,
        trackInventory: true
      };
    }

    if (!productData.ratings) {
      productData.ratings = {
        average: 0,
        count: 0
      };
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product status (active/inactive)
export const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

// Update user status (active/inactive)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Update review approval status
export const updateReviewApproval = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    ).populate('user', 'name email').populate('product', 'name slug');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review,
      message: `Review ${isApproved ? 'approved' : 'unapproved'} successfully`
    });

  } catch (error) {
    console.error('Update review approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review approval'
    });
  }
};

// Get users with enhanced data
export const getUsersEnhanced = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { search, status = 'all' } = req.query;

    // Build filter
    const filter = {};
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with order stats
    const users = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.pricing.total'
              }
            }
          }
        }
      },
      {
        $project: {
          otpCode: 0,
          otpExpires: 0,
          otpSendCount: 0,
          otpVerifyAttempts: 0,
          orders: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users enhanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get orders with enhanced data
export const getOrdersEnhanced = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders enhanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get transactions with enhanced data
export const getTransactionsEnhanced = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { type, category, search } = req.query;

    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    
    if (search) {
      // We'll need to populate first, then filter, so let's use aggregation
      const transactions = await Transaction.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: 'order',
            foreignField: '_id',
            as: 'order'
          }
        },
        {
          $match: {
            $or: [
              { 'user.name': { $regex: search, $options: 'i' } },
              { 'user.email': { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { 'order.orderNumber': { $regex: search, $options: 'i' } }
            ]
          }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            order: { $arrayElemAt: ['$order', 0] }
          }
        },
        {
          $project: {
            'user.otpCode': 0,
            'user.otpExpires': 0,
            'user.otpSendCount': 0,
            'user.otpVerifyAttempts': 0
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const totalTransactions = await Transaction.countDocuments({
        ...filter,
        $or: [
          { description: { $regex: search, $options: 'i' } }
        ]
      });

      const totalPages = Math.ceil(totalTransactions / limit);

      return res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: page,
            totalPages,
            totalTransactions,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    }

    const transactions = await Transaction.find(filter)
      .populate('user', 'name phone email')
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get transactions enhanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Get reviews with enhanced data
export const getReviewsEnhanced = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter = {};
    if (status === 'approved') filter.isApproved = true;
    else if (status === 'pending') filter.isApproved = false;
    else if (status === 'verified') filter.isVerified = true;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reviews enhanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};
