import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// Create new order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddressId, rewardPointsUsed = 0, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Get shipping address
    const shippingAddress = await Address.findOne({
      _id: shippingAddressId,
      user: userId,
      isActive: true
    });

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }

    // Validate and get products
    const productIds = items.map(item => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products are not available'
      });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.inventory.trackInventory && product.inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images.primary,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Calculate shipping (free shipping for orders above ₹500)
    const shippingCost = subtotal >= 500 ? 0 : 50;

    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18);

    // Validate reward points
    const user = await User.findById(userId);
    if (rewardPointsUsed > user.rewardPoints) {
      throw new Error('Insufficient reward points');
    }

    // Calculate final total
    const total = subtotal + shippingCost + tax - rewardPointsUsed;

    if (total < 0) {
      throw new Error('Invalid order total');
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: shippingAddress.formatForShipping(),
      pricing: {
        subtotal,
        discount: 0,
        rewardPointsUsed,
        shipping: shippingCost,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      rewards: {
        pointsEarned: Math.round(subtotal * 0.01), // 1% cashback in points
        pointsUsed: rewardPointsUsed,
        cashbackEarned: 0
      }
    });

    await order.save({ session });

    // Update product stock
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (product.inventory.trackInventory) {
        product.inventory.stock -= item.quantity;
        await product.save({ session });
      }
    }

    // Update user reward points if used
    if (rewardPointsUsed > 0) {
      user.rewardPoints -= rewardPointsUsed;
      await user.save({ session });

      // Create redemption transaction
      await Transaction.createRedemption({
        userId,
        orderId: order._id,
        category: 'purchase',
        amount: rewardPointsUsed,
        points: rewardPointsUsed,
        description: `Redeemed ${rewardPointsUsed} points for order ${order.orderNumber}`,
        reference: order.orderNumber,
        source: 'purchase'
      });
    }

    await session.commitTransaction();

    // Populate order for response
    await order.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  } finally {
    session.endSession();
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const filter = { user: userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product', 'name slug images.primary')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('items.product', 'name slug images.primary ratings');

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

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, carrier, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;

    // Update shipping info if provided
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (carrier) order.shipping.carrier = carrier;

    // Add timeline entry
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    await order.save();

    // If order is delivered, award reward points
    if (status === 'delivered' && order.rewards.pointsEarned > 0) {
      const user = await User.findById(order.user);
      if (user) {
        user.rewardPoints += order.rewards.pointsEarned;
        user.totalSpent += order.pricing.total;
        await user.save();

        // Create earning transaction
        await Transaction.createEarning({
          userId: order.user,
          orderId: order._id,
          category: 'purchase',
          amount: order.rewards.pointsEarned,
          points: order.rewards.pointsEarned,
          description: `Earned ${order.rewards.pointsEarned} points from order ${order.orderNumber}`,
          reference: order.orderNumber,
          source: 'purchase'
        });
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
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

// Cancel order
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Order cancelled by customer'
    });

    await order.save({ session });

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackInventory) {
        product.inventory.stock += item.quantity;
        await product.save({ session });
      }
    }

    // Refund reward points if used
    if (order.pricing.rewardPointsUsed > 0) {
      const user = await User.findById(userId);
      user.rewardPoints += order.pricing.rewardPointsUsed;
      await user.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  } finally {
    session.endSession();
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.getStats(userId);

    res.json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};
