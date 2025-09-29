import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './models/Coupon.js';

dotenv.config();

const couponsData = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    isGlobal: true,
    isActive: true,
    usageLimit: 1,
    minOrderAmount: 500,
    description: '10% off on first order'
  },
  {
    code: 'SAVE100',
    type: 'fixed',
    value: 100,
    isGlobal: true,
    isActive: true,
    usageLimit: 1,
    minOrderAmount: 1000,
    description: '₹100 off on orders above ₹1000'
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 99,
    isGlobal: true,
    isActive: true,
    usageLimit: 0, // Unlimited
    minOrderAmount: 500,
    description: 'Free shipping on orders above ₹500'
  },
  {
    code: 'NEWUSER',
    type: 'percentage',
    value: 15,
    isGlobal: true,
    isActive: true,
    usageLimit: 1,
    minOrderAmount: 300,
    description: '15% off for new users'
  }
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');

    // Insert new coupons
    await Coupon.insertMany(couponsData);
    console.log('Coupons seeded successfully!');

    // Display seeded coupons
    const coupons = await Coupon.find({});
    console.log('\nSeeded Coupons:');
    coupons.forEach(coupon => {
      console.log(`- ${coupon.code}: ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off`);
    });

  } catch (error) {
    console.error('Error seeding coupons:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedCoupons();
