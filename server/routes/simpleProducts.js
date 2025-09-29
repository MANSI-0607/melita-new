import express from 'express';
import SimpleProduct from '../models/SimpleProduct.js';
import SimpleReview from '../models/SimpleReview.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /api/products/:slug - Get product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await SimpleProduct.findOne({ slug: req.params.slug });
    console.log("product");
    console.log(product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/products/:slug/reviews - Get all reviews for a product
router.get('/:slug/reviews', async (req, res) => {
  try {
    const product = await SimpleProduct.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const reviews = await SimpleReview.find({ productId: product._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/products/:slug/reviews - Add a review (requires JWT auth)
router.post('/:slug/reviews', async (req, res) => {
  try {
    // Check for JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'melita_dev_secret');
    
    const product = await SimpleProduct.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new SimpleReview({
      productId: product._id,
      userName: decoded.name || 'Anonymous',
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
