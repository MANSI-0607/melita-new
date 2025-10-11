import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
const reviewUploadsDir = path.join(uploadsBaseDir, 'reviews');
try {
  if (!fs.existsSync(uploadsBaseDir)) fs.mkdirSync(uploadsBaseDir);
  if (!fs.existsSync(reviewUploadsDir)) fs.mkdirSync(reviewUploadsDir);
} catch (e) {
  // Log but don't crash server startup
  console.error('Failed to ensure uploads directory:', e);
}

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sort = 'createdAt', order = 'desc' } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviews = await Review.getProductReviews(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      rating,
      sort,
      order
    });

    const total = await Review.countDocuments({
      product: productId,
      status: 'approved'
    });

    // Get review statistics
    const stats = await Review.getReviewStats(productId);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        stats: stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
        }
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews'
    });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, reviewText, images } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Process images if provided
    const reviewImages = [];
    if (images && Array.isArray(images)) {
      for (let index = 0; index < images.length; index++) {
        const img = images[index];
        const src = img?.url || '';
        if (!src) continue;

        // If client sent a data URL, decode and store locally
        const dataUrlMatch = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (dataUrlMatch) {
          const mime = dataUrlMatch[1];
          const b64 = dataUrlMatch[2];
          const ext = mime.split('/')[1].toLowerCase().replace('jpeg', 'jpg');
          const safeExt = ext.match(/^[a-z0-9.+-]+$/) ? ext : 'png';
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
          const filePath = path.join(reviewUploadsDir, filename);
          try {
            fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
            // Public URL served by Express static at /uploads
            const publicUrl = `/uploads/reviews/${filename}`;
            reviewImages.push({ url: publicUrl, alt: img.alt || `Review image ${index + 1}` });
          } catch (e) {
            console.error('Failed to save review image:', e);
          }
        } else {
          // If already a normal URL or path, keep as-is
          reviewImages.push({ url: src, alt: img.alt || `Review image ${index + 1}` });
        }
      }
    }

    // Create review (no purchase requirement)
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      title,
      reviewText,
      images: reviewImages,
      verified: false, // Will be set by admin approval
      status: 'pending', // All reviews start as pending
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        device: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });

    await review.save();

    // Populate user data for response
    await review.populate('user', 'name phone');

    // Award review bonus (50 points)
    try {
      const user = await User.findById(userId);
      if (user) {
        user.rewardPoints += 50;
        await user.save();

        // Create transaction record
        await Transaction.createEarning({
          userId,
          orderId: null,
          category: 'review',
          amount: 50,
          points: 50,
          description: `Review bonus for ${product.name}`,
          reference: review._id,
          source: 'review'
        });
      }
    } catch (rewardError) {
      console.error('Failed to award review bonus:', rewardError);
      // Don't fail the review creation if reward fails
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval. You earned 50 reward points!',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, reviewText } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or cannot be updated'
      });
    }

    // Update review
    review.rating = rating;
    review.title = title;
    review.reviewText = reviewText;
    review.status = 'pending'; // Reset to pending for moderation

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.markHelpful(reviewId, userId);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpful.count,
        isHelpful: review.helpful.users.includes(userId)
      }
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark review as helpful'
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews'
    });
  }
};

// Get review statistics for a product
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await Review.getReviewStats(productId);

    res.json({
      success: true,
      data: stats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
      }
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
};

// Check if user can review product
export const canUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.json({
        success: true,
        data: {
          canReview: false,
          existingReview: {
            id: existingReview._id,
            rating: existingReview.rating,
            title: existingReview.title,
            status: existingReview.status
          }
        }
      });
    }

    // Any logged-in user can review (no purchase requirement)
    res.json({
      success: true,
      data: {
        canReview: true,
        hasPurchased: false, // Not relevant anymore
        verified: false // Will be set by admin approval
      }
    });

  } catch (error) {
    console.error('Check user can review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility'
    });
  }
};
