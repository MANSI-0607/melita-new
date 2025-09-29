import mongoose from 'mongoose';
import SimpleProduct from './models/SimpleProduct.js';
import SimpleReview from './models/SimpleReview.js';
import dotenv from 'dotenv';

dotenv.config();

async function quickSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Check if products already exist
    const existingProducts = await SimpleProduct.countDocuments();
    if (existingProducts > 0) {
      console.log(`Products already exist (${existingProducts} found). Skipping seed.`);
      return;
    }

    console.log('No products found. Seeding database...');

    // Create products
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
      }
    ];

    const createdProducts = await SimpleProduct.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Create reviews
    const reviews = [
      {
        productId: createdProducts[0]._id,
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Amazing cleanser! My skin feels so clean and fresh. Highly recommend!'
      },
      {
        productId: createdProducts[0]._id,
        userName: 'Mike Chen',
        rating: 4,
        comment: 'Good product, gentle on my sensitive skin. Will buy again.'
      },
      {
        productId: createdProducts[1]._id,
        userName: 'Emma Wilson',
        rating: 5,
        comment: 'This essence is incredible! My skin has never looked better.'
      }
    ];

    const createdReviews = await SimpleReview.insertMany(reviews);
    console.log(`Created ${createdReviews.length} reviews`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

quickSeed();
