import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SimpleProduct from './models/SimpleProduct.js';
import SimpleReview from './models/SimpleReview.js';

dotenv.config();

async function testSimpleProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Check if products exist
    const products = await SimpleProduct.find({});
    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.slug})`);
    });

    // Check if reviews exist
    const reviews = await SimpleReview.find({});
    console.log(`\nFound ${reviews.length} reviews:`);
    reviews.forEach(review => {
      console.log(`- ${review.userName}: ${review.rating}/5 - ${review.comment.substring(0, 50)}...`);
    });

    // Test specific product
    const cleanser = await SimpleProduct.findOne({ slug: 'cleanser' });
    if (cleanser) {
      console.log(`\nCleanser product found: ${cleanser.name}`);
      const cleanserReviews = await SimpleReview.find({ productId: cleanser._id });
      console.log(`Cleanser has ${cleanserReviews.length} reviews`);
    } else {
      console.log('\nCleanser product not found!');
    }

  } catch (error) {
    console.error('Error testing simple products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSimpleProducts();
