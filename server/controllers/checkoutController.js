import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';
import Coupon from '../models/Coupon.js';

// Get user addresses
export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, addresses });
});

// Add new address
export const addAddress = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, addressline1, addressline2, state, pincode } = req.body;

  const address = new Address({
    userId: req.user.id,
    first_name,
    last_name,
    email,
    phone,
    addressline1,
    addressline2,
    state,
    pincode
  });

  const savedAddress = await address.save();
  res.status(201).json({ success: true, address: savedAddress });
});

// Get available coupons
export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ 
    $or: [
      { userId: req.user.id, isActive: true },
      { isGlobal: true, isActive: true }
    ]
  }).sort({ createdAt: -1 });

  res.json({ success: true, coupons });
});

// Apply coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  const coupon = await Coupon.findOne({
    code: couponCode,
    $or: [
      { userId: req.user.id, isActive: true },
      { isGlobal: true, isActive: true }
    ]
  });

  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
  }

  // Check if user has already used this coupon
  if (coupon.usageLimit === 1) {
    const existingUsage = await Transaction.findOne({
      userId: req.user.id,
      couponId: coupon._id,
      type: 'coupon_used'
    });

    if (existingUsage) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }
  }

  res.json({ success: true, coupon });
});

// Create order (COD)
export const createCodOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingMethod, coupon, coinsUsed, totals } = req.body;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod.charge || 0;
  const couponDiscount = coupon ? (coupon.type === 'percentage' ? 
    (subtotal * coupon.value / 100) : coupon.value) : 0;
  const coinsDiscount = coinsUsed || 0;
  const totalDiscount = couponDiscount + coinsDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const cashbackEarned = Math.floor(Math.max(0, subtotal - couponDiscount) * 0.20);

  // Create order
  const order = new Order({
    userId: req.user.id,
    items: items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    customer: {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: {
        line1: customer.addressline1,
        line2: customer.addressline2,
        state: customer.state,
        pincode: customer.pincode
      }
    },
    shipping: {
      method: shippingMethod.label,
      cost: shippingCost
    },
    payment: {
      method: 'COD',
      status: 'pending'
    },
    pricing: {
      subtotal,
      shippingCost,
      couponDiscount,
      coinsDiscount,
      totalDiscount,
      grandTotal,
      cashbackEarned
    },
    status: 'pending'
  });

  const savedOrder = await order.save();

  // Update user coins if used
  if (coinsUsed > 0) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints: -coinsUsed }
    });
  }

  // Add cashback
  if (cashbackEarned > 0) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints: cashbackEarned }
    });
  }

  // Create transactions
  if (couponDiscount > 0) {
    await Transaction.create({
      userId: req.user.id,
      orderId: savedOrder._id,
      type: 'coupon_used',
      amount: couponDiscount,
      description: `Used coupon: ${coupon.code}`
    });
  }

  if (coinsDiscount > 0) {
    await Transaction.create({
      userId: req.user.id,
      orderId: savedOrder._id,
      type: 'coins_used',
      amount: coinsDiscount,
      description: `Used ${coinsDiscount} coins`
    });
  }

  if (cashbackEarned > 0) {
    await Transaction.create({
      userId: req.user.id,
      orderId: savedOrder._id,
      type: 'cashback_earned',
      amount: cashbackEarned,
      description: `Earned ${cashbackEarned} coins`
    });
  }

  // Generate order ID
  const orderId = `MLTA${String(savedOrder._id).slice(-6).padStart(6, '0')}`;

  res.status(201).json({
    success: true,
    orderId,
    order: savedOrder
  });
});

// Create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingMethod, coupon, coinsUsed, totals } = req.body;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod.charge || 0;
  const couponDiscount = coupon ? (coupon.type === 'percentage' ? 
    (subtotal * coupon.value / 100) : coupon.value) : 0;
  const coinsDiscount = coinsUsed || 0;
  const totalDiscount = couponDiscount + coinsDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);

  // Create Razorpay order
  const Razorpay = require('razorpay');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(grandTotal * 100), // Convert to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`
  });

  // Create order in database
  const order = new Order({
    userId: req.user.id,
    items: items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    customer: {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: {
        line1: customer.addressline1,
        line2: customer.addressline2,
        state: customer.state,
        pincode: customer.pincode
      }
    },
    shipping: {
      method: shippingMethod.label,
      cost: shippingCost
    },
    payment: {
      method: 'Razorpay',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id
    },
    pricing: {
      subtotal,
      shippingCost,
      couponDiscount,
      coinsDiscount,
      totalDiscount,
      grandTotal
    },
    status: 'pending'
  });

  const savedOrder = await order.save();

  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: razorpayOrder.id,
    orderId: savedOrder._id
  });
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

  // Verify payment signature
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  // Update order
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.payment.status = 'completed';
  order.payment.razorpayPaymentId = razorpay_payment_id;
  order.status = 'processing';
  await order.save();

  // Update user coins and create transactions
  const { pricing } = order;
  
  if (order.pricing.coinsDiscount > 0) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints: -order.pricing.coinsDiscount }
    });
  }

  if (order.pricing.cashbackEarned > 0) {
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints: order.pricing.cashbackEarned }
    });
  }

  // Generate order ID
  const formattedOrderId = `MLTA${String(order._id).slice(-6).padStart(6, '0')}`;

  res.json({
    success: true,
    orderId: formattedOrderId
  });
});
