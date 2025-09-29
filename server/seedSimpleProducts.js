import mongoose from 'mongoose';
import SimpleProduct from './models/SimpleProduct.js';
import SimpleReview from './models/SimpleReview.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedSimpleProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Clear existing data
    await SimpleProduct.deleteMany({});
    await SimpleReview.deleteMany({});

    // Seed 8 products with IDs 1-8
    const products = [
      {
        id: 1,
        slug: 'cleanser',
        name: 'Melita Renewing Gel Cleanser',
        description: 'A gentle yet effective cleanser that removes impurities while maintaining the skin barrier.',
        price: 335,
        image: '/assets/product_img/cleanser/cleanser1.jpg'
      },
      {
        id: 2,
        slug: 'essence',
        name: 'Melita Ultra Hydrating Essence',
        description: 'Lightweight hydrating essence that penetrates deep into skin layers.',
        price: 1199,
        image: '/assets/product_img/essence/essence1.jpg'
      },
      {
        id: 3,
        slug: 'moisturizer',
        name: 'Melita Balancing Moisturizer',
        description: 'Provides intense moisturization while balancing oil production.',
        price: 1099,
        image: '/assets/product_img/moisturizer/moisturizer1.jpg'
      },
      {
        id: 4,
        slug: 'sunscreen',
        name: 'Melita Ultra Protecting Sunscreen',
        description: 'SPF 50+ PA++++ broad spectrum protection designed for Indian skin.',
        price: 1299,
        image: '/assets/product_img/sunscreen/sunscreen1.jpg'
      },
      {
        id: 5,
        slug: 'barrier-boost-combo',
        name: 'Melita Barrier Boost Combo',
        description: 'Complete skincare routine to strengthen and protect your skin barrier.',
        price: 2299,
        image: '/assets/product_img/combo.jpg'
      },
      {
        id: 6,
        slug: 'dry-skin-daily-essentials',
        name: 'Melita Dry Skin Daily Essentials',
        description: 'Essential products for dry skin care routine.',
        price: 3606,
        image: '/assets/product_img/dryskin.jpg'
      },
      {
        id: 7,
        slug: 'oily-skin-daily-essentials',
        name: 'Melita Oily Skin Daily Essentials',
        description: 'Essential products for oily skin care routine.',
        price: 2593,
        image: '/assets/product_img/oilyskin.jpg'
      },
      {
        id: 8,
        slug: 'barrier-care-starter-duo',
        name: 'Melita Barrier Care Starter Duo',
        description: 'Perfect starter kit for barrier care routine.',
        price: 1499,
        image: '/assets/product_img/duo.jpg'
      }
    ];

    const createdProducts = await SimpleProduct.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Add some sample reviews using the actual product ObjectIds
    const sampleReviews = [
      {
        productId: createdProducts[0]._id, // Cleanser
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Amazing cleanser! My skin feels so clean and fresh. Highly recommend!'
      },
      {
        productId: createdProducts[0]._id, // Cleanser
        userName: 'Mike Chen',
        rating: 4,
        comment: 'Good product, gentle on my sensitive skin. Will buy again.'
      },
      {
        productId: createdProducts[1]._id, // Essence
        userName: 'Emma Wilson',
        rating: 5,
        comment: 'This essence is incredible! My skin has never looked better.'
      },
      {
        productId: createdProducts[2]._id, // Moisturizer
        userName: 'David Brown',
        rating: 4,
        comment: 'Great moisturizer, perfect for my combination skin.'
      },
      {
        productId: createdProducts[3]._id, // Sunscreen
        userName: 'Lisa Garcia',
        rating: 5,
        comment: 'Best sunscreen I have ever used! No white cast and feels lightweight.'
      },
      {
        productId: createdProducts[4]._id, // Barrier Boost Combo
        userName: 'Alex Thompson',
        rating: 5,
        comment: 'This combo has transformed my skin! Worth every penny.'
      }
    ];

    const createdReviews = await SimpleReview.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} sample reviews`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSimpleProducts();
