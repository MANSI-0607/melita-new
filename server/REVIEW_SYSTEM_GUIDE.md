<!-- # Melita Review System - Complete Integration Guide

## Overview
The review system allows users to write, read, and interact with product reviews. It includes reward points for verified purchases and helpful voting functionality.

## Features

### ✅ Core Features
- **Product Reviews**: Users can write reviews for products they've purchased
- **Rating System**: 1-5 star rating system with visual distribution
- **Verification**: Reviews from actual purchases are marked as "verified"
- **Reward Points**: 50 points awarded for each review (from verified purchases)
- **Helpful Voting**: Users can mark reviews as helpful
- **Moderation**: Reviews can be approved/rejected by admins
- **User Management**: Users can edit/delete their own reviews

### ✅ Security & Validation
- **Authentication Required**: Only logged-in users can write reviews
- **Duplicate Prevention**: Users can only review each product once
- **Purchase Verification**: Verified reviews require actual product purchase
- **Input Validation**: All review data is validated and sanitized
- **Rate Limiting**: Prevents spam and abuse

## Backend Implementation

### Models

#### Review Model (`server/models/Review.js`)
```javascript
{
  product: ObjectId,      // Reference to Product
  user: ObjectId,         // Reference to User
  order: ObjectId,        // Optional: Reference to Order (for verification)
  rating: Number,         // 1-5 stars
  title: String,          // Review title
  reviewText: String,     // Review content
  images: [String],       // Optional: Review images
  verified: Boolean,      // Verified purchase
  helpful: {
    count: Number,        // Helpful votes count
    users: [ObjectId]     // Users who marked as helpful
  },
  status: String,         // pending/approved/rejected
  metadata: Object        // IP, user agent, etc.
}
```

### API Endpoints

#### Public Endpoints
- `GET /reviews/product/:productId` - Get product reviews
- `GET /reviews/product/:productId/stats` - Get review statistics
- `POST /reviews/product/:productId/helpful/:reviewId` - Mark review as helpful

#### Protected Endpoints (Authentication Required)
- `POST /reviews/product/:productId` - Create a review
- `GET /reviews/product/:productId/can-review` - Check if user can review
- `GET /reviews/user` - Get user's reviews
- `PUT /reviews/:reviewId` - Update review
- `DELETE /reviews/:reviewId` - Delete review

### Example API Calls

#### Get Product Reviews
```bash
GET /reviews/product/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=10&rating=5
```

#### Create Review
```bash
POST /reviews/product/64f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer <jwt_token>
{
  "rating": 5,
  "title": "Amazing product!",
  "reviewText": "This product exceeded my expectations...",
  "orderId": "64f8a1b2c3d4e5f6a7b8c9d1" // Optional for verification
}
```

#### Check Review Eligibility
```bash
GET /reviews/product/64f8a1b2c3d4e5f6a7b8c9d0/can-review
Authorization: Bearer <jwt_token>
```

## Frontend Implementation

### API Service (`client/src/services/api.js`)
The API service provides methods for all review-related operations:

```javascript
// Get product reviews
const reviews = await apiService.getProductReviews(productId, { page: 1, limit: 10 });

// Create a review
const newReview = await apiService.createReview(productId, {
  rating: 5,
  title: "Great product!",
  reviewText: "Really love this product..."
});

// Mark review as helpful
await apiService.markReviewHelpful(productId, reviewId);

// Check if user can review
const eligibility = await apiService.canUserReview(productId);
```

### React Hooks (`client/src/hooks/useReviews.js`)

#### useProductReviews Hook
```javascript
const { reviews, stats, loading, error, refetch } = useProductReviews(productId);
```

#### useCreateReview Hook
```javascript
const { createReview, loading } = useCreateReview();
```

#### useCanUserReview Hook
```javascript
const { canReview, hasPurchased, verified, existingReview } = useCanUserReview(productId);
```

### ProductReview Component

#### Basic Usage
```jsx
import ProductReview from '@/components/ProductReview';

<ProductReview 
  productId="64f8a1b2c3d4e5f6a7b8c9d0" 
  productSlug="melita-renewing-gel-cleanser" 
/>
```

#### Component Props
- `productId` (required): MongoDB ObjectId of the product
- `productSlug` (optional): Product slug for SEO

#### Features
- **Real-time Data**: Automatically fetches and displays reviews
- **Interactive Rating**: Star rating with hover effects
- **Review Form**: Modal form for writing reviews
- **Helpful Voting**: Click to mark reviews as helpful
- **Verification Status**: Shows verified purchase badges
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## Database Integration

### Product Model Updates
The Product model automatically updates its ratings when reviews are created/updated:

```javascript
// Product.ratings gets updated automatically
{
  average: 4.8,    // Calculated from all approved reviews
  count: 25        // Total number of approved reviews
}
```

### User Model Integration
Users earn reward points for reviews:

```javascript
// 50 points awarded for each review
user.rewardPoints += 50;
```

## Setup Instructions

### 1. Backend Setup
```bash
cd server

# Install dependencies (if not already done)
npm install

# Create .env file
cp env.example .env

# Start MongoDB
mongod

# Seed database with sample data
node seedData.js

# Start server
npm start
```

### 2. Frontend Setup
```bash
cd client

# Install dependencies (if not already done)
npm install

# Create .env file
cp env.example .env

# Start development server
npm run dev
```

### 3. Environment Variables

#### Server (.env)
```env
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/melita
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Testing the Review System

### 1. Create Test Users
```bash
# Use the seeded users or create new ones via API
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "name": "Test User", "type": "signup"}'
```

### 2. Test Review Creation
```bash
# Get JWT token after OTP verification
# Then create a review
curl -X POST http://localhost:5000/reviews/product/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Great product!",
    "reviewText": "Really love this product. Highly recommend!"
  }'
```

### 3. Test Frontend Integration
1. Navigate to any product page
2. Scroll to the reviews section
3. Click "Write a review" (if logged in)
4. Fill out the review form
5. Submit and see the review appear

## Sample Data

The seed script creates:
- **5 Products**: Cleanser, Essence, Moisturizer, Sunscreen, Combo
- **3 Users**: Test users with different loyalty tiers
- **5 Reviews**: Sample reviews for testing

## Reward System Integration

### Earning Points
- **Review Bonus**: 50 points per review
- **Verified Purchase**: Reviews from actual orders are verified
- **Automatic Processing**: Points are awarded automatically

### Transaction Tracking
All review bonuses are tracked in the Transaction model:
```javascript
{
  type: 'earn',
  category: 'review',
  amount: 50,
  points: 50,
  description: 'Review bonus for Product Name',
  source: 'review'
}
```

## Security Considerations

### Input Validation
- Rating: Must be 1-5
- Title: Max 200 characters
- Review Text: Max 1000 characters
- XSS Protection: All text is sanitized

### Authorization
- Only authenticated users can write reviews
- Users can only edit/delete their own reviews
- Admin users can moderate all reviews

### Rate Limiting
- Prevents spam reviews
- Limits API calls per user
- Protects against abuse

## Performance Optimization

### Database Indexes
```javascript
// Review model indexes
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
```

### Caching Strategy
- Review statistics can be cached
- Popular reviews can be cached
- User review eligibility can be cached

## Future Enhancements

### Planned Features
- **Image Uploads**: Allow users to upload review images
- **Review Reactions**: Like/dislike reviews
- **Review Replies**: Allow responses to reviews
- **Review Moderation**: Admin panel for review management
- **Review Analytics**: Detailed review statistics
- **Review Templates**: Pre-written review templates

### Integration Opportunities
- **Email Notifications**: Notify users when their reviews are approved
- **Social Sharing**: Share reviews on social media
- **Review Widgets**: Embed reviews on other pages
- **API Webhooks**: Notify external systems of new reviews

## Troubleshooting

### Common Issues

#### 1. Reviews Not Showing
- Check if reviews are approved (status: 'approved')
- Verify product ID is correct
- Check API endpoint is accessible

#### 2. Cannot Write Review
- Ensure user is authenticated
- Check if user already reviewed the product
- Verify product exists and is active

#### 3. Reward Points Not Awarded
- Check if review is from verified purchase
- Verify transaction was created
- Check user reward points balance

#### 4. Frontend Not Loading
- Check API URL in environment variables
- Verify CORS settings on server
- Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=melita:reviews
```

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify database connections
3. Test API endpoints directly
4. Check environment variables
5. Review the code documentation

---

**The review system is now fully integrated and ready for production use!** -->
