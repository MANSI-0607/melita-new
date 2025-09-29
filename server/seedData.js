// Sample data seeder for Melita E-commerce
// Run with: node seedData.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import Review from './models/Review.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Melita Renewing Gel Cleanser',
    slug: 'melita-renewing-gel-cleanser',
    description: 'A gentle yet effective cleanser that removes impurities while maintaining the skin barrier. Formulated with natural extracts and dermatologically tested for sensitive skin.',
    shortDescription: 'Gentle gel cleanser for all skin types',
    price: 335,
    originalPrice: 375,
    category: 'cleanser',
    skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
    images: {
      primary: '/images/products/cleanser1.jpg',
      hover: '/images/products/cleanser2.jpg',
      gallery: [
        '/images/products/cleanser1.jpg',
        '/images/products/cleanser2.jpg',
        '/images/products/cleanser3.jpg',
        '/images/products/cleanser4.jpg',
        '/images/products/cleanser5.jpg'
      ]
    },
    benefits: [
      'Deeply cleanses without stripping natural oils',
      'Refreshes skin with natural extracts',
      'Dermatologically tested for sensitive skin',
      'Suitable for daily use'
    ],
    ingredients: [
      'Aloe Vera Extract',
      'Green Tea Extract',
      'Hyaluronic Acid',
      'Glycerin'
    ],
    howToUse: [
      'Wet face with lukewarm water',
      'Apply small amount and massage gently',
      'Rinse thoroughly',
      'Use twice daily'
    ],
    specifications: {
      volume: '100ml',
      weight: '100g',
      skinType: ['all'],
      ageGroup: ['18-25', '26-35', '36-45', '46-55', '55+']
    },
    inventory: {
      stock: 100,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 5.0,
      count: 5
    },
    isActive: true,
    isFeatured: true,
    tags: ['cleanser', 'gentle', 'sensitive-skin', 'daily-use'],
    seo: {
      metaTitle: 'Melita Renewing Gel Cleanser - Gentle Daily Face Wash',
      metaDescription: 'Gentle gel cleanser for all skin types. Removes impurities while maintaining skin barrier. Dermatologically tested.',
      keywords: ['face cleanser', 'gentle cleanser', 'skin care', 'daily cleanser']
    }
  },
  {
    name: 'Melita Ultra Hydrating Essence',
    slug: 'melita-ultra-hydrating-essence',
    description: 'Lightweight hydrating essence that penetrates deep into skin layers. Provides intense moisture and improves skin texture.',
    shortDescription: 'Intense hydration essence for glowing skin',
    price: 1199,
    originalPrice: 1499,
    category: 'essence',
    skinType: ['dry', 'combination', 'normal'],
    images: {
      primary: '/images/products/essence1.jpg',
      hover: '/images/products/essence2.jpg',
      gallery: [
        '/images/products/essence1.jpg',
        '/images/products/essence2.jpg',
        '/images/products/essence3.jpg',
        '/images/products/essence4.jpg',
        '/images/products/essence5.jpg',
        '/images/products/essence6.jpg',
        '/images/products/essence7.jpg',
        '/images/products/essence8.jpg'
      ],
      videos: ['/videos/products/essence1.mp4']
    },
    benefits: [
      'Deep hydration that lasts all day',
      'Improves skin texture and elasticity',
      'Reduces fine lines and wrinkles',
      'Non-greasy formula'
    ],
    ingredients: [
      'Hyaluronic Acid',
      'Niacinamide',
      'Peptide Complex',
      'Vitamin E'
    ],
    howToUse: [
      'Apply after cleansing and toning',
      'Dispense 2-3 drops on fingertips',
      'Gently pat onto face and neck',
      'Use morning and evening'
    ],
    specifications: {
      volume: '30ml',
      weight: '30g',
      skinType: ['dry', 'combination', 'normal'],
      ageGroup: ['26-35', '36-45', '46-55', '55+']
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 4.88,
      count: 56
    },
    isActive: true,
    isFeatured: true,
    tags: ['essence', 'hydration', 'anti-aging', 'premium'],
    seo: {
      metaTitle: 'Melita Ultra Hydrating Essence - Premium Anti-Aging Skincare',
      metaDescription: 'Premium hydrating essence with hyaluronic acid and peptides. Improves skin texture and reduces fine lines.',
      keywords: ['hydrating essence', 'anti-aging', 'hyaluronic acid', 'premium skincare']
    }
  },
  {
    name: 'Melita Balancing Moisturizer',
    slug: 'melita-balancing-moisturizer',
    description: 'Provides intense moisturization while balancing oil production. Perfect for combination and oily skin types.',
    shortDescription: 'Lightweight moisturizer for balanced skin',
    price: 1099,
    originalPrice: 1299,
    category: 'moisturizer',
    skinType: ['oily', 'combination'],
    images: {
      primary: '/images/products/moisturizer1.jpg',
      hover: '/images/products/moisturizer2.jpg',
      gallery: [
        '/images/products/moisturizer1.jpg',
        '/images/products/moisturizer2.jpg'
      ]
    },
    benefits: [
      'Controls excess oil production',
      'Provides lightweight hydration',
      'Non-comedogenic formula',
      'Matte finish'
    ],
    ingredients: [
      'Salicylic Acid',
      'Niacinamide',
      'Ceramides',
      'Tea Tree Extract'
    ],
    howToUse: [
      'Apply to clean skin',
      'Use morning and evening',
      'Massage gently until absorbed',
      'Follow with sunscreen in morning'
    ],
    specifications: {
      volume: '50ml',
      weight: '50g',
      skinType: ['oily', 'combination'],
      ageGroup: ['18-25', '26-35', '36-45']
    },
    inventory: {
      stock: 60,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 4.95,
      count: 19
    },
    isActive: true,
    isFeatured: true,
    tags: ['moisturizer', 'oily-skin', 'combination-skin', 'oil-control'],
    seo: {
      metaTitle: 'Melita Balancing Moisturizer - Oil Control & Hydration',
      metaDescription: 'Lightweight moisturizer for oily and combination skin. Controls oil production while providing hydration.',
      keywords: ['moisturizer oily skin', 'oil control', 'combination skin', 'lightweight moisturizer']
    }
  },
  {
    name: 'Melita Ultra Protecting Sunscreen',
    slug: 'melita-ultra-protecting-sunscreen',
    description: 'SPF 50+ PA++++ broad spectrum protection designed specifically for Indian skin. Non-greasy and water-resistant.',
    shortDescription: 'High protection sunscreen for Indian skin',
    price: 1299,
    originalPrice: 1450,
    category: 'sunscreen',
    skinType: ['dry', 'oily', 'combination', 'sensitive', 'normal', 'all'],
    images: {
      primary: '/images/products/sunscreen1.jpg',
      hover: '/images/products/sunscreen2.jpg',
      gallery: [
        '/images/products/sunscreen1.jpg',
        '/images/products/sunscreen2.jpg'
      ]
    },
    benefits: [
      'SPF 50+ PA++++ protection',
      'Broad spectrum UVA/UVB protection',
      'Water-resistant up to 80 minutes',
      'Non-greasy, lightweight formula'
    ],
    ingredients: [
      'Zinc Oxide',
      'Titanium Dioxide',
      'Vitamin E',
      'Aloe Vera Extract'
    ],
    howToUse: [
      'Apply 15 minutes before sun exposure',
      'Use 2 finger lengths for face',
      'Reapply every 2 hours',
      'Use daily, even indoors'
    ],
    specifications: {
      volume: '75ml',
      weight: '75g',
      spf: '50+',
      pa: '++++',
      skinType: ['all'],
      ageGroup: ['all']
    },
    inventory: {
      stock: 80,
      lowStockThreshold: 10,
      trackInventory: true
    },
    ratings: {
      average: 5.0,
      count: 4
    },
    isActive: true,
    isFeatured: true,
    tags: ['sunscreen', 'spf50', 'sun-protection', 'water-resistant'],
    seo: {
      metaTitle: 'Melita Ultra Protecting Sunscreen SPF 50+ PA++++',
      metaDescription: 'High protection sunscreen SPF 50+ PA++++ for Indian skin. Water-resistant and non-greasy formula.',
      keywords: ['sunscreen spf 50', 'sun protection', 'pa++++', 'water resistant sunscreen']
    }
  },
  {
    name: 'Melita Barrier Boost Combo',
    slug: 'melita-barrier-boost-combo',
    description: 'Complete skincare routine to strengthen and protect your skin barrier. Includes cleanser and moisturizer.',
    shortDescription: 'Complete barrier care routine',
    price: 2299,
    originalPrice: 2798,
    category: 'combo',
    skinType: ['dry', 'sensitive', 'normal'],
    images: {
      primary: '/images/products/combo1.jpg',
      hover: '/images/products/combo2.jpg',
      gallery: [
        '/images/products/combo1.jpg',
        '/images/products/combo2.jpg'
      ]
    },
    benefits: [
      'Strengthens skin barrier',
      'Complete daily routine',
      'Suitable for sensitive skin',
      'Cost-effective bundle'
    ],
    ingredients: [
      'Ceramides',
      'Hyaluronic Acid',
      'Niacinamide',
      'Peptides'
    ],
    howToUse: [
      'Morning: Cleanse, moisturize, sunscreen',
      'Evening: Cleanse, moisturize',
      'Use products in sequence',
      'Consistent daily use recommended'
    ],
    specifications: {
      volume: 'Combo Pack',
      weight: '200g',
      skinType: ['dry', 'sensitive', 'normal'],
      ageGroup: ['all']
    },
    inventory: {
      stock: 25,
      lowStockThreshold: 5,
      trackInventory: true
    },
    ratings: {
      average: 4.93,
      count: 14
    },
    isActive: true,
    isFeatured: true,
    tags: ['combo', 'barrier-care', 'sensitive-skin', 'routine'],
    seo: {
      metaTitle: 'Melita Barrier Boost Combo - Complete Skincare Routine',
      metaDescription: 'Complete skincare routine for barrier care. Includes cleanser and moisturizer for sensitive skin.',
      keywords: ['skincare combo', 'barrier care', 'sensitive skin routine', 'skincare bundle']
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/melita');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);

    // Create sample users for testing
    const sampleUsers = [];
    const userData = [
      {
        name: 'Test User',
        phone: '+1234567890',
        email: 'test@melita.com',
        rewardPoints: 500,
        loyaltyTier: 'silver'
      },
      {
        name: 'Pooja Chugwani',
        phone: '+1234567891',
        email: 'pooja@example.com',
        rewardPoints: 250,
        loyaltyTier: 'bronze'
      },
      {
        name: 'Aman Singh',
        phone: '+1234567892',
        email: 'aman@example.com',
        rewardPoints: 100,
        loyaltyTier: 'bronze'
      }
    ];

    for (const userInfo of userData) {
      let user = await User.findOne({ phone: userInfo.phone });
      if (!user) {
        user = new User(userInfo);
        await user.save();
        sampleUsers.push(user);
      } else {
        sampleUsers.push(user);
      }
    }

    console.log(`Created/found ${sampleUsers.length} sample users`);

    // Create sample reviews
    await Review.deleteMany({});
    
    const sampleReviews = [
      {
        user: sampleUsers[1]._id, // Pooja Chugwani
        product: products[0]._id, // Cleanser
        rating: 5,
        title: 'Best face wash ever',
        reviewText: 'I love using this face wash. I am already on my second tube. It gently cleans my skin and leaves it fresh, hydrating and clean. I would definitely recommend everyone to go for it.',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[2]._id, // Aman Singh
        product: products[0]._id, // Cleanser
        rating: 5,
        title: 'Amazing Product!',
        reviewText: 'This product is fantastic. My skin has never felt better. Highly recommend!',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[0]._id, // Test User
        product: products[0]._id, // Cleanser
        rating: 4,
        title: 'Good but could be better',
        reviewText: 'It works well, but I wish it was a bit more moisturizing. Still a great product overall.',
        verified: false,
        status: 'approved'
      },
      {
        user: sampleUsers[1]._id, // Pooja Chugwani
        product: products[1]._id, // Essence
        rating: 5,
        title: 'Perfect hydration',
        reviewText: 'This essence is amazing! My skin feels so hydrated and plump. The texture is lightweight and absorbs quickly.',
        verified: true,
        status: 'approved'
      },
      {
        user: sampleUsers[2]._id, // Aman Singh
        product: products[1]._id, // Essence
        rating: 4,
        title: 'Great product',
        reviewText: 'Really good essence. Skin feels smooth and hydrated. Would definitely buy again.',
        verified: true,
        status: 'approved'
      }
    ];

    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} sample reviews`);

    console.log('Database seeded successfully!');
    console.log('\nSample products created:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ₹${product.price}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedDatabase();
