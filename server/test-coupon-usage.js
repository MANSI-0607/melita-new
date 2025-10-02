import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const testCouponUsage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test user ID (replace with actual user ID)
    const testUserId = '68de8b32eb66b9a0bacd2cfe'; // Replace with actual user ID
    const couponId = '68deabc70ee69591917264ab'; // Your coupon ID

    console.log('Testing coupon usage tracking...');

    // Check existing coupon usage transactions
    const existingUsage = await Transaction.find({
      user: testUserId,
      'metadata.source': 'coupon',
      'metadata.couponId': couponId
    });

    console.log('Existing coupon usage transactions:', existingUsage.length);
    existingUsage.forEach(tx => {
      console.log(`- Transaction ${tx._id}: ${tx.description}, couponId: ${tx.metadata.couponId}`);
    });

    // Check distinct coupon IDs used by this user
    const usedCouponIds = await Transaction.distinct('metadata.couponId', {
      user: testUserId,
      'metadata.source': 'coupon'
    });

    console.log('Used coupon IDs:', usedCouponIds);

    // Check if this specific coupon is in the used list
    const isUsed = usedCouponIds.includes(String(couponId));
    console.log(`Coupon ${couponId} is used:`, isUsed);

    // Get the coupon details
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      console.log(`Coupon details: ${coupon.code}, usageLimit: ${coupon.usageLimit}`);
      
      if (coupon.usageLimit === 1 && isUsed) {
        console.log('✅ One-time coupon should be blocked for this user');
      } else if (coupon.usageLimit === 1 && !isUsed) {
        console.log('⚠️ One-time coupon is available for this user');
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testCouponUsage();
