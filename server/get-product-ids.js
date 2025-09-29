// Script to get actual product IDs from the database
import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function getProductIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Get all products with their IDs and slugs
    const products = await Product.find({}, '_id name slug').lean();
    
    console.log('\n📦 Products in database:');
    console.log('='.repeat(60));
    
    const productMapping = {};
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log('');
      
      // Create mapping for frontend
      const frontendId = index + 1;
      productMapping[frontendId] = product._id.toString();
    });

    console.log('\n🔗 Frontend to Backend ID Mapping:');
    console.log('='.repeat(60));
    console.log('export const PRODUCT_ID_MAPPING = {');
    Object.entries(productMapping).forEach(([frontendId, backendId]) => {
      console.log(`  ${frontendId}: '${backendId}', // ${products[frontendId - 1]?.slug || 'unknown'}`);
    });
    console.log('};');

  } catch (error) {
    console.error('Error getting product IDs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

getProductIds();
