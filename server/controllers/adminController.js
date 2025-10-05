import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import Seller from '../models/Seller.js';
import Coupon from '../models/Coupon.js';

// Admin credentials (in production, store in database with hashed password)
const ADMIN_CREDENTIALS = {
  username: 'admin@melita.in',
  password: 'Kites@123'
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

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, phone, email, rewardPoints = 0, isActive = true } = req.body;
   
    // Validate required fields (email optional, no password)
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check if user already exists (by phone always, and email if provided)
    const orConditions = [{ phone }];
    if (email) orConditions.push({ email });
    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    // Create new user (no password)
    const user = new User({
      name,
      phone,
      email: email || undefined,
      rewardPoints,
      isActive,
      isVerified: true, // Admin-created users are automatically verified
      addedBy: { name: 'admin' }
    });


    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
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

// Admin create review
export const createReviewAsAdmin = async (req, res) => {
  try {
    const { 
      userName, 
      productId, 
      rating, 
      title, 
      reviewText, 
      customDate,
      isApproved = true,
      isVerified = false 
    } = req.body;

    // Validate required fields
    if (!userName || !productId || !rating || !title || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userName, productId, rating, title, reviewText'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create review with simple user name (no user object needed)
    const review = new Review({
      product: productId,
      userName: userName, // Store name directly
      rating: parseInt(rating),
      title,
      reviewText,
      customDate: customDate ? new Date(customDate) : null,
      verified: isVerified,
      status: isApproved ? 'approved' : 'pending',
      metadata: {
        source: 'admin',
        ipAddress: req.ip,
        userAgent: 'Admin Panel'
      }
    });

    await review.save();

    // Populate product data for response
    await review.populate('product', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Admin create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
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

// ===== ADMIN COUPON MANAGEMENT =====

// Get all coupons (Admin only)
export const getAdminCoupons = async (req, res) => {
  try {
    console.log('Admin coupons request:', req.query);
    const { page = 1, limit = 10, search, type, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    console.log('Coupon filter:', filter);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const coupons = await Coupon.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Coupon.countDocuments(filter);
    
    console.log(`Found ${coupons.length} coupons, total: ${total}`);
    
    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
};

// Get single coupon by ID (Admin only)
export const getAdminCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id).populate('userId', 'name email phone');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Get admin coupon by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon'
    });
  }
};

// Create new coupon (Admin only)
export const createAdminCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      userId,
      userPhone,
      isGlobal,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      description
    } = req.body;
    
    // Validate required fields
    if (!code || !type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Code, type, and value are required'
      });
    }
    
    // Validate type and value
    if (!['fixed', 'percentage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "fixed" or "percentage"'
      });
    }
    
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100'
      });
    }
    
    if (value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Value must be positive'
      });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    // Determine scope and link user by id or phone for user-specific coupons
    let resolvedUserId = null;
    let resolvedUserPhone = null;
    
    if (isGlobal) {
      resolvedUserId = null;
      resolvedUserPhone = null;
    } else {
      // User-specific: require either userId or userPhone
      if (!userId && !userPhone) {
        return res.status(400).json({
          success: false,
          message: 'Provide either userId or userPhone for a user-specific coupon, or set isGlobal to true'
        });
      }

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }
        resolvedUserId = user._id;
        resolvedUserPhone = user.phone;
      } else if (userPhone) {
        const user = await User.findOne({ phone: userPhone });
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'User with this phone number not found. Please create the user first, then link the coupon.'
          });
        }
        resolvedUserId = user._id;
        resolvedUserPhone = user.phone;
      }
    }
    
    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      userId: resolvedUserId,
      userPhone: resolvedUserPhone,
      isGlobal: isGlobal || false,
      usageLimit: usageLimit || 1,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      description
    });
    
    await coupon.save();
    
    // Populate user data for response
    await coupon.populate('userId', 'name email phone');
    
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create admin coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
};

// Update coupon (Admin only)
export const updateAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      userId,
      userPhone,
      isGlobal,
      isActive,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      description
    } = req.body;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    // Validate type and value if provided
    if (type && !['fixed', 'percentage'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "fixed" or "percentage"'
      });
    }
    
    if (value !== undefined) {
      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Value must be positive'
        });
      }
      
      if ((type || coupon.type) === 'percentage' && (value < 0 || value > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Percentage value must be between 0 and 100'
        });
      }
    }
    
    // Check if new coupon code already exists (if code is being changed)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }
    
    // Handle user linking for updates
    if (isGlobal === false && (userId || userPhone)) {
      let targetUser = null;
      if (userId) {
        targetUser = await User.findById(userId);
      } else if (userPhone) {
        targetUser = await User.findOne({ phone: userPhone });
      }
      
      if (!targetUser) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      
      coupon.userId = targetUser._id;
      coupon.userPhone = targetUser.phone;
      coupon.isGlobal = false;
    }
    
    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (isGlobal !== undefined) {
      coupon.isGlobal = isGlobal;
      if (isGlobal) {
        coupon.userId = null;
        coupon.userPhone = null;
      }
    }
    if (isActive !== undefined) coupon.isActive = isActive;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (description !== undefined) coupon.description = description;
    
    await coupon.save();
    
    // Populate user data for response
    await coupon.populate('userId', 'name email phone');
    
    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Update admin coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
};

// Delete coupon (Admin only)
export const deleteAdminCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    await Coupon.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
};

// Toggle coupon status (Admin only)
export const toggleAdminCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Toggle admin coupon status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status'
    });
  }
};

// Get coupon statistics (Admin only)
export const getAdminCouponStats = async (req, res) => {
  try {
    console.log('Admin coupon stats request');
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ 
      validUntil: { $lt: new Date() },
      isActive: true
    });
    const globalCoupons = await Coupon.countDocuments({ isGlobal: true });
    const userSpecificCoupons = await Coupon.countDocuments({ isGlobal: false });
    
    const stats = {
      total: totalCoupons,
      active: activeCoupons,
      inactive: totalCoupons - activeCoupons,
      expired: expiredCoupons,
      global: globalCoupons,
      userSpecific: userSpecificCoupons
    };
    
    console.log('Coupon stats:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get admin coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics'
    });
  }
};

// ===== ADMIN SELLER MANAGEMENT =====

// Get all sellers (Admin only)
export const getAdminSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sellers = await Seller.find(filter)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Seller.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sellers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers'
    });
  }
};

// Get single seller by ID (Admin only)
export const getAdminSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Get admin seller by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller'
    });
  }
};

// Create new seller (Admin only)
export const createAdminSeller = async (req, res) => {
  try {
    const { name, contact, password, status = 'active' } = req.body;

    // Validate required fields
    if (!name || !contact || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact, and password are required'
      });
    }

    // Check if seller with this contact already exists
    const existingSeller = await Seller.findByContact(contact);
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Seller with this contact number already exists'
      });
    }

    // Validate contact number format
    if (!/^[6-9]\d{9}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: 'Contact number must be a valid 10-digit Indian mobile number'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Create seller
    const seller = new Seller({
      name: name.trim(),
      contact,
      password,
      status
    });

    await seller.save();

    // Remove password from response
    const sellerResponse = seller.toJSON();

    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      data: sellerResponse
    });
  } catch (error) {
    console.error('Create admin seller error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create seller'
    });
  }
};

// Update seller (Admin only)
export const updateAdminSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, status } = req.body;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update fields if provided
    if (name) seller.name = name.trim();
    if (status) seller.status = status;

    // Handle contact update
    if (contact && contact !== seller.contact) {
      // Check if new contact already exists
      const existingSeller = await Seller.findByContact(contact);
      if (existingSeller && existingSeller._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Another seller with this contact number already exists'
        });
      }

      // Validate contact number format
      if (!/^[6-9]\d{9}$/.test(contact)) {
        return res.status(400).json({
          success: false,
          message: 'Contact number must be a valid 10-digit Indian mobile number'
        });
      }

      seller.contact = contact;
    }

    await seller.save();

    // Remove password from response
    const sellerResponse = seller.toJSON();

    res.json({
      success: true,
      message: 'Seller updated successfully',
      data: sellerResponse
    });
  } catch (error) {
    console.error('Update admin seller error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update seller'
    });
  }
};

// Update seller password (Admin only)
export const updateAdminSellerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    seller.password = newPassword;
    await seller.save();

    res.json({
      success: true,
      message: 'Seller password updated successfully'
    });
  } catch (error) {
    console.error('Update admin seller password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update seller password'
    });
  }
};

// Toggle seller status (Admin only)
export const toggleAdminSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Toggle status
    seller.status = seller.status === 'active' ? 'banned' : 'active';
    await seller.save();

    res.json({
      success: true,
      message: `Seller ${seller.status === 'active' ? 'unbanned' : 'banned'} successfully`,
      data: seller.toJSON()
    });
  } catch (error) {
    console.error('Toggle admin seller status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle seller status'
    });
  }
};

// Delete seller (Admin only)
export const deleteAdminSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    await Seller.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete seller'
    });
  }
};

// Get seller statistics (Admin only)
export const getAdminSellerStats = async (req, res) => {
  try {
    const totalSellers = await Seller.countDocuments();
    const activeSellers = await Seller.countDocuments({ status: 'active' });
    const bannedSellers = await Seller.countDocuments({ status: 'banned' });
    const inactiveSellers = await Seller.countDocuments({ status: 'inactive' });

    res.json({
      success: true,
      data: {
        total: totalSellers,
        active: activeSellers,
        banned: bannedSellers,
        inactive: inactiveSellers
      }
    });
  } catch (error) {
    console.error('Get admin seller stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller statistics'
    });
  }
};
