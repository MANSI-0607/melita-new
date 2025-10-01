import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';
import Coupon from '../models/Coupon.js';

// Get user addresses
export const getUserAddresses = asyncHandler(async (req, res) => {
  const docs = await Address.find({ user: req.user._id, isActive: true }).sort({ isDefault: -1, updatedAt: -1 });
  const addresses = docs.map((a) => {
    const obj = a.toObject();
    return { id: String(a._id), ...obj };
  });
  res.json({ success: true, addresses });
});

// Add new address
export const addAddress = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, addressline1, addressline2, state, pincode, isDefault } = req.body;

  if (!Address.validatePincode(pincode)) {
    return res.status(400).json({ success: false, message: 'Invalid pincode format' });
  }

  const address = new Address({
    user: req.user._id,
    first_name,
    last_name,
    email,
    phone,
    addressline1,
    addressline2,
    state,
    pincode,
    isDefault: !!isDefault,
    isActive: true,
  });

  const savedAddress = await address.save();
  const obj = savedAddress.toObject();
  res.status(201).json({ success: true, address: { id: String(savedAddress._id), ...obj } });
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
  try {
    const { items, shippingMethod, coupon, coinsUsed = 0, shippingAddressId } = req.body;

    // Validate request
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    if (!shippingAddressId) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Load shipping address from Address collection
    const addressDoc = await Address.findOne({ _id: shippingAddressId, user: req.user._id, isActive: true });
    if (!addressDoc) {
      return res.status(400).json({ success: false, message: 'Invalid shipping address' });
    }

  // Find products by slug from cart items
  const slugs = items.map((i) => i.slug).filter(Boolean);
  const products = await Product.find({ slug: { $in: slugs }, isActive: true });
  if (products.length !== slugs.length) {
    return res.status(400).json({ success: false, message: 'Some products are not available' });
  }

  // Build order items as per schema
  let subtotal = 0;
  const orderItems = items.map((cartItem) => {
    const product = products.find((p) => p.slug === cartItem.slug);
    const qty = cartItem.quantity || 1;
    const price = product?.price ?? cartItem.price ?? 0;
    const originalPrice = product?.originalPrice ?? product?.price ?? cartItem.price ?? 0;
    const itemSubtotal = price * qty;
    subtotal += itemSubtotal;
    return {
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.primary || cartItem.image || '',
      price,
      originalPrice,
      quantity: qty,
      subtotal: itemSubtotal,
    };
  });

  // Shipping and taxes
  const shippingCost = Math.max(0, shippingMethod?.charge || 0);
  const tax = 0; // include GST here if needed

  // Discounts
  const couponDiscount = coupon ? (coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value) : 0;
  const rewardPointsUsed = Math.max(0, coinsUsed || 0);
  const discount = Math.max(0, couponDiscount);
  const total = Math.max(0, subtotal + shippingCost + tax - discount - rewardPointsUsed);

  // Map shipping method id to enum
  const shippingMethodMap = {
    'free-standard': 'standard',
    'standard': 'standard',
    'express': 'express',
  };
  const shippingMethodEnum = shippingMethodMap[shippingMethod?.id] || 'standard';

  // Generate order number manually as fallback
  const orderCount = await Order.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  const orderNumber = `MLT${timestamp}${(orderCount + 1).toString().padStart(4, '0')}`;

  const order = new Order({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress: addressDoc.formatForShipping(),
    pricing: {
      subtotal,
      discount,
      rewardPointsUsed,
      shipping: shippingCost,
      tax,
      total,
    },
    payment: {
      method: 'cod',
      status: 'pending',
    },
    shipping: {
      method: shippingMethodEnum,
    },
    rewards: {
      pointsEarned: Math.round(subtotal * 0.01),
      pointsUsed: rewardPointsUsed,
      cashbackEarned: 0,
    },
    status: 'pending',
  });

  const savedOrder = await order.save();

  // Update user coins if used
  if (rewardPointsUsed > 0) {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { rewardPoints: -rewardPointsUsed }
    });
  }

  // No immediate cashback for COD at placement; can be added upon delivery if needed

  // Create transaction entries for COD order placement
  try {
    // Record the purchase (money) — category 'purchase'. Using type 'bonus' as a neutral monetary record.
    await Transaction.create({
      user: req.user._id,
      order: savedOrder._id,
      type: 'bonus',
      category: 'purchase',
      amount: total,
      description: `Order placed (COD) - ${savedOrder.orderNumber}`,
      points: { balance: 0 },
      status: 'completed'
    });

    // Record points redemption if user used points (category 'points')
    if (rewardPointsUsed > 0) {
      await Transaction.createRedemption({
        userId: req.user._id,
        orderId: savedOrder._id,
        category: 'points',
        amount: rewardPointsUsed,
        points: rewardPointsUsed,
        description: `Redeemed ${rewardPointsUsed} points for ${savedOrder.orderNumber}`,
        reference: savedOrder.orderNumber,
        source: 'purchase'
      });
    }
  } catch (txErr) {
    console.warn('COD transaction creation warning:', txErr?.message || txErr);
  }

  res.status(201).json({
    success: true,
    orderId: savedOrder.orderNumber,
    order: {
      _id: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      items: savedOrder.items,
      pricing: savedOrder.pricing,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt
    }
  });
  } catch (error) {
    console.error('Create COD order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
});

// Create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  try {
    const { items, shippingMethod, coupon, coinsUsed = 0, shippingAddressId } = req.body;
      console.log(req.body)
    // Validate request
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    if (!shippingAddressId) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Build products and order items
    const slugs = items.map((i) => i.slug).filter(Boolean);
    const products = await Product.find({ slug: { $in: slugs }, isActive: true });
    if (products.length !== slugs.length) {
      return res.status(400).json({ success: false, message: 'Some products are not available' });
    }

  let subtotal = 0;
  const orderItems = items.map((cartItem) => {
    const product = products.find((p) => p.slug === cartItem.slug);
    const qty = cartItem.quantity || 1;
    const price = product?.price ?? cartItem.price ?? 0;
    const originalPrice = product?.originalPrice ?? product?.price ?? cartItem.price ?? 0;
    const itemSubtotal = price * qty;
    subtotal += itemSubtotal;
    return {
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.primary || cartItem.image || '',
      price,
      originalPrice,
      quantity: qty,
      subtotal: itemSubtotal,
    };
  });

  const shippingCost = Math.max(0, shippingMethod?.charge || 0);
  const tax = 0;
  const couponDiscount = coupon ? (coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value) : 0;
  const rewardPointsUsed = Math.max(0, coinsUsed || 0);
  const discount = Math.max(0, couponDiscount);
  const total = Math.max(0, subtotal + shippingCost + tax - discount - rewardPointsUsed);

  // Validate environment keys
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) {
    return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
  }
  // Basic sanity check: Razorpay test keys usually start with 'rzp_'
  if (!keyId.startsWith('rzp_')) {
    console.warn('Razorpay keyId does not look correct (expected to start with rzp_)');
  }

  // Debug logging (masked)
  console.log('Razorpay Config:', {
    keyId: keyId.slice(0, 12) + '***',
    keySecretLength: keySecret.length,
    keySecretPrefix: keySecret.slice(0, 4) + '***'
  });

  // Create Razorpay order
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  // Enforce minimum amount 100 paise (Rs. 1) to satisfy Razorpay constraints
  const amountPaise = Math.max(100, Math.round(total * 100));

  let razorpayOrder;
  try {
    console.log('Creating Razorpay order with amount:', amountPaise, 'paise (Rs.', amountPaise/100, ')');
    razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    console.log('Razorpay order created successfully:', razorpayOrder.id);
  } catch (rpErr) {
    console.error('Create Razorpay order error:', {
      statusCode: rpErr?.statusCode,
      error: rpErr?.error || rpErr?.message,
      fullError: JSON.stringify(rpErr, null, 2)
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order. Please check Razorpay credentials.',
      debug: process.env.NODE_ENV === 'development' ? 'Check server logs for details' : undefined
    });
  }

  // Create order in database
  const addressDoc = await Address.findOne({ _id: shippingAddressId, user: req.user._id, isActive: true });
  if (!addressDoc) {
    return res.status(400).json({ success: false, message: 'Invalid shipping address' });
  }

  const shippingMethodMap = {
    'free-standard': 'standard',
    'standard': 'standard',
    'express': 'express',
  };
  const shippingMethodEnum = shippingMethodMap[shippingMethod?.id] || 'standard';

  // Generate order number manually as fallback
  const orderCount = await Order.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  const orderNumber = `MLT${timestamp}${(orderCount + 1).toString().padStart(4, '0')}`;

  const order = new Order({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress: addressDoc.formatForShipping(),
    pricing: {
      subtotal,
      discount,
      rewardPointsUsed,
      shipping: shippingCost,
      tax,
      total,
    },
    payment: {
      method: 'online',
      status: 'pending',
      transactionId: razorpayOrder.id,
      gatewayResponse: { razorpayOrderId: razorpayOrder.id },
    },
    shipping: { method: shippingMethodEnum },
    rewards: { pointsEarned: Math.round(subtotal * 0.01), pointsUsed: rewardPointsUsed, cashbackEarned: 0 },
    status: 'pending',
  });

  const savedOrder = await order.save();

  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: razorpayOrder.id,
    orderId: savedOrder._id.toString(), // MongoDB ObjectId for verification
    orderNumber: savedOrder.orderNumber, // Display-friendly order number
    amount: total
  });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order'
    });
  }
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
 
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data' });
    }

    // Verify payment signature
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
  order.payment.razorpayOrderId = razorpay_order_id;
  order.payment.razorpaySignature = razorpay_signature;
  order.status = 'processing';
  await order.save();

  // Update user coins and create transactions
  const pointsToDeduct = Math.max(0, order.pricing?.rewardPointsUsed || 0);
  const pointsToCredit = Math.max(0, order.rewards?.pointsEarned || 0);

  if (pointsToDeduct > 0) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { rewardPoints: -pointsToDeduct } });
  }
  if (pointsToCredit > 0) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { rewardPoints: pointsToCredit } });
  }

  // Create transaction entries after successful online payment verification
  try {
    // Record the purchase payment (category 'purchase')
    await Transaction.create({
      user: req.user._id,
      order: order._id,
      type: 'bonus',
      category: 'purchase',
      amount: order.pricing?.total || 0,
      description: `Payment captured - ${order.orderNumber}`,
      reference: razorpay_payment_id,
      points: { balance: 0 },
      status: 'completed'
    });

    // Record points redemption if any (category 'points')
    if (pointsToDeduct > 0) {
      await Transaction.createRedemption({
        userId: req.user._id,
        orderId: order._id,
        category: 'points',
        amount: pointsToDeduct,
        points: pointsToDeduct,
        description: `Redeemed ${pointsToDeduct} points for ${order.orderNumber}`,
        reference: razorpay_payment_id,
        source: 'purchase'
      });
    }

    // Record points earning if any (category 'points')
    if (pointsToCredit > 0) {
      await Transaction.createEarning({
        userId: req.user._id,
        orderId: order._id,
        category: 'points',
        amount: pointsToCredit,
        points: pointsToCredit,
        description: `Earned ${pointsToCredit} points for ${order.orderNumber}`,
        reference: razorpay_payment_id,
        source: 'purchase'
      });
    }
  } catch (txErr) {
    console.warn('Online payment transaction creation warning:', txErr?.message || txErr);
  }

  res.json({
    success: true,
    orderId: order.orderNumber,
    order: {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      payment: order.payment
    }
  });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});
