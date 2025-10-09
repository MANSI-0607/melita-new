import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import axios from 'axios';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Transaction from '../models/Transaction.js';
import Coupon from '../models/Coupon.js';

// =====================
// Fast2SMS helper (top-level)
// Template: "Hi {#VAR#}, your order #{#VAR#} has been successfully placed on Melita. Thank you for shopping with us! Website - melita.in"
// Variables mapping => [customerName, orderNumber]
// =====================
const sendOrderConfirmationSMS = async ({ phone, customerName, orderNumber }) => {
  try {
    const API_URL = 'https://www.fast2sms.com/dev/bulkV2';
    const API_KEY = process.env.FAST2SMS_API_KEY;
    const route = process.env.FAST2SMS_ROUTE || 'dlt';
    //const route = 'transactional';
    const sender_id = process.env.FAST2SMS_SENDER_ID || 'MELITA';
    const message = process.env.FAST2SMS_TEMPLATE_ID_ORDER_CONFIRMATION || '184313';
    const flash = '0';
    const numbers = String(phone || '').trim();
    if (!API_KEY || !numbers) return;

    const params = {
      authorization: API_KEY,
      route,
      sender_id,
      message,
      // Comma-separated values for {#VAR#} placeholders in the same order as template
      variables_values: `${customerName}|${orderNumber}`,

      numbers,
      flash,
      schedule_time: ''
    };

    await axios.get(API_URL, { params });
  } catch (err) {
    console.warn('Fast2SMS error:', err?.response?.data || err?.message || err);
  }
};

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
  // Fetch active coupons eligible for this user (global, direct, or group-specific), within validity window
  const now = new Date();
  const orConditions = [
    { isGlobal: true },
    { userId: req.user._id },
    { allowedUserIds: req.user._id },
  ];
  if (req.user?.phone) {
    orConditions.push({ userPhone: req.user.phone });
    orConditions.push({ allowedPhones: req.user.phone });
  }

  const coupons = await Coupon.find({
    isActive: true,
    $and: [
      { $or: orConditions },
      { validFrom: { $lte: now } },
      { $or: [ { validUntil: null }, { validUntil: { $gte: now } } ] }
    ]
  }).sort({ createdAt: -1 });

  // Find one-time coupons already used by this user via order metadata (consistent with seller flow)
  const usedCouponIds = await Order.distinct('metadata.couponId', {
    user: req.user._id,
    'metadata.couponId': { $ne: null }
  });

  // Exclude coupons with usageLimit === 1 that have been used already
  const filtered = coupons.filter(c => {
    if ((c.usageLimit || 1) === 1 && usedCouponIds?.length) {
      // Convert both to strings for proper comparison
      return !usedCouponIds.includes(String(c._id));
    }
    return true;
  });

  res.json({ success: true, coupons: filtered });
});

// Apply coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  const coupon = await Coupon.findOne({
    code: couponCode,
    $or: [
      { userId: req.user.id, isActive: true },
      { userPhone: req.user.phone, isActive: true },
      { allowedUserIds: req.user._id, isActive: true },
      { allowedPhones: req.user.phone, isActive: true },
      { isGlobal: true, isActive: true }
    ]
  });

  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
  }

  // Check if user has already used this coupon (consistent with seller flow)
  if ((coupon.usageLimit || 1) === 1) {
    const existed = await Order.findOne({
      user: req.user._id,
      'metadata.couponId': String(coupon._id)
    });
    if (existed) {
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

  // Discounts - separate coupon and reward points
  const couponDiscount = coupon ? (coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value) : 0;
  const rewardPointsUsed = Math.max(0, coinsUsed || 0);
  const total = Math.max(0, subtotal + shippingCost + tax - couponDiscount - rewardPointsUsed);

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

  // Adjusted subtotal used to compute reward earnings (after coupon and points, before shipping/tax)
  const adjustedSubtotal = Math.max(0, subtotal - couponDiscount - rewardPointsUsed);

  const order = new Order({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress: addressDoc.formatForShipping(),
    pricing: {
      subtotal,
      discount: couponDiscount, // Only coupon discount
      rewardPointsUsed,
      shipping: shippingCost,
      tax,
      total,
    },
    // Persist coupon info for later verification/usage tracking
    coupon: coupon ? {
      id: coupon._id || coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      usageLimit: coupon.usageLimit
    } : null,
    payment: {
      method: 'cod',
      status: 'completed', // COD orders are considered confirmed upon placement
    },
    shipping: {
      method: shippingMethodEnum,
    },
    // Rewards: 10% of adjusted subtotal (after coupon and points, before shipping/tax)
    rewards: {
      pointsEarned: Math.round(adjustedSubtotal * 0.1),
      pointsUsed: rewardPointsUsed,
      cashbackEarned: 0,
    },
    // Add metadata for coupon tracking (consistent with seller flow)
    metadata: {
      couponId: coupon?._id || coupon?.id || null,
      couponCode: coupon?.code || null,
      coinsUsed: rewardPointsUsed
    },
    status: 'confirmed',
  });

  const savedOrder = await order.save();

  // User points will be updated automatically by Transaction pre-save middleware
  // No immediate manual update needed here

  // Create transaction entries for COD order placement
  try {
    // Record payment for COD as an admin-visible transaction
    await Transaction.create({
      user: req.user._id,
      order: savedOrder._id,
      type: 'purchase',
      category: 'purchase',
      amount: total,
      description: `Order placed (COD) - ${savedOrder.orderNumber}`,
      reference: savedOrder.orderNumber,
      points: { balance: 0 },
      status: 'completed',
      metadata: { source: 'purchase' }
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
    // Record reward points earning for COD (10% of adjusted subtotal)
    const pointsToCredit = Math.round(adjustedSubtotal * 0.1);
    if (pointsToCredit > 0) {
      await Transaction.createEarning({
        userId: req.user._id,
        orderId: savedOrder._id,
        category: 'points',
        amount: pointsToCredit,
        points: pointsToCredit,
        description: `Earned ${pointsToCredit} points for ${savedOrder.orderNumber}`,
        reference: savedOrder.orderNumber,
        source: 'purchase'
      });
    }

    // Record coupon usage (separate from reward points) if a coupon was applied
    if (couponDiscount > 0 && coupon?.code) {
      // Idempotency: ensure not duplicated for same order
      const existingCouponTx = await Transaction.findOne({
        user: req.user._id,
        order: savedOrder._id,
        'metadata.couponId': String(coupon._id),
        'metadata.source': 'coupon'
      });
      if (!existingCouponTx) {
        await Transaction.create({
          user: req.user._id,
          order: savedOrder._id,
          type: 'redeem',
          category: 'promotion',
          amount: couponDiscount,
          description: `Used coupon '${coupon.code}' - ₹${couponDiscount} discount`,
          reference: savedOrder.orderNumber,
          points: { balance: 0 }, // No points involved in coupon usage
          status: 'completed',
          metadata: { source: 'coupon', couponId: String(coupon._id), code: coupon.code }
        });
      }
    }
  } catch (txErr) {
    console.warn('COD transaction creation warning:', txErr?.message || txErr);
  }

  // Fire-and-forget SMS (no await needed to avoid blocking response)
  try {
    const customerName = (req.user?.name || `${addressDoc.first_name ?? ''} ${addressDoc.last_name ?? ''}`.trim()).trim();
    const phone = req.user?.phone || addressDoc.phone;
    sendOrderConfirmationSMS({ phone, customerName, orderNumber });
  } catch {}

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
  const total = Math.max(0, subtotal + shippingCost + tax - couponDiscount - rewardPointsUsed);

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

  // Adjusted subtotal used to compute reward earnings (after coupon and points, before shipping/tax)
  const adjustedSubtotalRazorpay = Math.max(0, subtotal - couponDiscount - rewardPointsUsed);

  const order = new Order({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress: addressDoc.formatForShipping(),
    pricing: {
      subtotal,
      discount: couponDiscount, // Only coupon discount
      rewardPointsUsed,
      shipping: shippingCost,
      tax,
      total,
    },
    // Persist coupon info for later verification/usage tracking
    coupon: coupon ? {
      id: coupon._id || coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      usageLimit: coupon.usageLimit
    } : null,
    payment: {
      method: 'online',
      status: 'pending',
      transactionId: razorpayOrder.id,
      gatewayResponse: { razorpayOrderId: razorpayOrder.id },
    },
    shipping: { method: shippingMethodEnum },
    // Rewards: 10% of adjusted subtotal (after coupon and points, before shipping/tax)
    rewards: { pointsEarned: Math.round(adjustedSubtotalRazorpay * 0.1), pointsUsed: rewardPointsUsed, cashbackEarned: 0 },
    // Add metadata for coupon tracking (consistent with seller flow)
    metadata: {
      couponId: coupon?._id || coupon?.id || null,
      couponCode: coupon?.code || null,
      coinsUsed: rewardPointsUsed
    },
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
  // Move order from pending to confirmed immediately after successful payment
  order.status = 'confirmed';
  await order.save();

  // Calculate points for transactions (user balance will be updated by Transaction middleware)
  const pointsToDeduct = Math.max(0, order.pricing?.rewardPointsUsed || 0);
  const pointsToCredit = Math.max(0, order.rewards?.pointsEarned || 0);

  // Create transaction entries after successful online payment verification
  try {
    // Admin-visible payment record (idempotent by payment id)
    const existingPayment = await Transaction.findOne({
      user: req.user._id,
      order: order._id,
      type: 'purchase',
      category: 'purchase',
      reference: razorpay_payment_id
    });

    if (!existingPayment) {
      await Transaction.create({
        user: req.user._id,
        order: order._id,
        type: 'purchase',
        category: 'purchase',
        amount: order.pricing?.total || 0,
        description: `Payment captured - ${order.orderNumber}`,
        reference: razorpay_payment_id,
        points: { balance: 0 },
        status: 'completed',
        metadata: { source: 'purchase' }
      });
    }

    // Points redemption (if any)
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

    // Points earning (cashback)
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

    // Coupon usage record after successful online payment (separate from reward points)
    if (order?.pricing?.discount > 0 && order?.coupon?.code) {
      const existingCouponTx = await Transaction.findOne({
        user: req.user._id,
        order: order._id,
        'metadata.couponId': String(order.coupon.id),
        'metadata.source': 'coupon'
      });
      if (!existingCouponTx) {
        await Transaction.create({
          user: req.user._id,
          order: order._id,
          type: 'redeem',
          category: 'promotion',
          amount: order.pricing.discount,
          description: `Used coupon '${order.coupon.code}' - ₹${order.pricing.discount} discount`,
          reference: razorpay_payment_id,
          points: { balance: 0 }, // No points involved in coupon usage
          status: 'completed',
          metadata: { source: 'coupon', couponId: String(order.coupon.id), code: order.coupon.code }
        });
      }
    }
  } catch (txErr) {
    console.warn('Online payment transaction creation warning:', txErr?.message || txErr);
  }

  // Fire-and-forget SMS on successful online payment
  try {
    const customerName = (req.user?.name || `${order?.shippingAddress?.first_name ?? ''} ${order?.shippingAddress?.last_name ?? ''}`.trim()).trim();
    const phone = req.user?.phone || order?.shippingAddress?.phone;
    sendOrderConfirmationSMS({ phone, customerName, orderNumber: order.orderNumber });
  } catch {}

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
