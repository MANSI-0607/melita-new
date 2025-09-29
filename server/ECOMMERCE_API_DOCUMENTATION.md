<!-- # Melita E-commerce API Documentation

## Overview
Complete backend API for Melita skincare e-commerce platform with OTP authentication, product management, order processing, and reward system.

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 🔐 Authentication (`/auth`)

#### Send OTP
**POST** `/auth/send-otp`
```json
{
  "phone": "+1234567890",
  "name": "John Doe",
  "type": "signup" // or "login"
}
```

#### Verify OTP
**POST** `/auth/verify-otp`
```json
{
  "phone": "+1234567890",
  "otp": "123456",
  "type": "signup" // or "login"
}
```

#### Get Profile
**GET** `/auth/profile`
*Requires authentication*

---

### 🛍️ Products (`/products`)

#### Get All Products
**GET** `/products?page=1&limit=12&category=cleanser&skinType=oily&sort=price&order=asc`

#### Get Featured Products
**GET** `/products/featured?limit=8`

#### Get Product by ID/Slug
**GET** `/products/:id`

#### Search Products
**GET** `/products/search?q=cleanser&limit=20`

#### Get Categories
**GET** `/products/categories`

#### Get Related Products
**GET** `/products/:id/related?limit=4`

#### Get Product Filters
**GET** `/products/filters`

---

### 📦 Orders (`/orders`)
*All routes require authentication*

#### Create Order
**POST** `/orders`
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddressId": "address_id",
  "rewardPointsUsed": 100,
  "paymentMethod": "cod"
}
```

#### Get User Orders
**GET** `/orders?status=pending&page=1&limit=10`

#### Get Single Order
**GET** `/orders/:orderId`

#### Cancel Order
**PATCH** `/orders/:orderId/cancel`

#### Get Order Statistics
**GET** `/orders/stats`

---

### 👤 Profile (`/profile`)
*All routes require authentication*

#### Get Profile
**GET** `/profile`

#### Update Profile
**PUT** `/profile`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "preferences": {
    "skinType": "oily",
    "ageGroup": "26-35",
    "skinConcerns": ["acne", "oiliness"]
  }
}
```

#### Get Dashboard Data
**GET** `/profile/dashboard`

#### Get Referral Data
**GET** `/profile/referral`

#### Update Notification Preferences
**PUT** `/profile/notifications`
```json
{
  "newsletter": true,
  "smsNotifications": false,
  "pushNotifications": true
}
```

#### Get Loyalty Information
**GET** `/profile/loyalty`

---

### 📍 Addresses (`/addresses`)
*All routes require authentication*

#### Get User Addresses
**GET** `/addresses`

#### Get Default Address
**GET** `/addresses/default`

#### Create Address
**POST** `/addresses`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "addressType": "home",
  "isDefault": true
}
```

#### Update Address
**PUT** `/addresses/:addressId`

#### Set Default Address
**PATCH** `/addresses/:addressId/default`

#### Delete Address
**DELETE** `/addresses/:addressId`

#### Validate Pincode
**GET** `/addresses/validate/:pincode`

---

### 🎁 Rewards (`/rewards`)
*All routes require authentication*

#### Get Reward Balance
**GET** `/rewards/balance`

#### Get Transaction History
**GET** `/rewards/transactions?type=earn&page=1&limit=20`

#### Get Reward Summary
**GET** `/rewards/summary`

#### Redeem Points
**POST** `/rewards/redeem`
```json
{
  "points": 500,
  "orderId": "order_id"
}
```

#### Get Earning Opportunities
**GET** `/rewards/opportunities`

#### Award Referral Bonus
**POST** `/rewards/referral-bonus`
```json
{
  "referredUserId": "user_id"
}
```

#### Award Review Bonus
**POST** `/rewards/review-bonus`
```json
{
  "orderId": "order_id",
  "productId": "product_id",
  "reviewId": "review_id"
}
```

---

## Data Models

### User
```javascript
{
  name: String,
  phone: String (unique),
  email: String,
  dateOfBirth: Date,
  gender: String,
  rewardPoints: Number,
  totalSpent: Number,
  loyaltyTier: String,
  preferences: {
    skinType: String,
    ageGroup: String,
    skinConcerns: [String],
    newsletter: Boolean,
    smsNotifications: Boolean,
    pushNotifications: Boolean
  },
  referralCode: String,
  referredBy: ObjectId,
  profileCompletion: Number
}
```

### Product
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  skinType: [String],
  images: {
    primary: String,
    hover: String,
    gallery: [String],
    videos: [String]
  },
  benefits: [String],
  ingredients: [String],
  inventory: {
    stock: Number,
    lowStockThreshold: Number,
    trackInventory: Boolean
  },
  ratings: {
    average: Number,
    count: Number
  },
  isActive: Boolean,
  isFeatured: Boolean
}
```

### Order
```javascript
{
  orderNumber: String (unique),
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  shippingAddress: Object,
  pricing: {
    subtotal: Number,
    discount: Number,
    rewardPointsUsed: Number,
    shipping: Number,
    tax: Number,
    total: Number
  },
  status: String,
  payment: {
    method: String,
    status: String,
    transactionId: String
  },
  rewards: {
    pointsEarned: Number,
    pointsUsed: Number,
    cashbackEarned: Number
  }
}
```

### Transaction
```javascript
{
  user: ObjectId,
  order: ObjectId,
  type: String, // 'earn', 'redeem', 'expire'
  category: String, // 'purchase', 'referral', 'review'
  amount: Number,
  points: {
    earned: Number,
    redeemed: Number,
    balance: Number
  },
  description: String,
  status: String,
  metadata: {
    source: String,
    campaignId: String,
    multiplier: Number
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (access denied)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

---

## Rate Limiting

### OTP Requests:
- 30-second cooldown between requests
- Maximum 5 requests per hour per phone number

### OTP Verification:
- Maximum 5 attempts per 15-minute window

---

## Reward System

### Earning Points:
- **Purchase**: 1 point per ₹1 spent
- **Referral**: 500 points when friend makes first purchase
- **Review**: 50 points per verified product review
- **Birthday**: 1000 points (if date of birth added)

### Redeeming Points:
- Minimum redemption: 100 points
- 1 point = ₹1 discount
- Points can be used for orders

### Loyalty Tiers:
- **Bronze**: Default tier
- **Silver**: ₹10,000+ spent (5% discount, 1.2x points)
- **Gold**: ₹25,000+ spent (10% discount, 1.5x points, free shipping)
- **Platinum**: ₹50,000+ spent (15% discount, 2x points, free shipping)

---

## Environment Variables

```env
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/melita
PORT=5000
FAST2SMS_API_KEY=your_fast2sms_api_key
FAST2SMS_SENDER_ID=MELITA
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create Environment File**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   mongod
   ```

4. **Start Server**:
   ```bash
   npm start
   ```

5. **Test API**:
   ```bash
   node check-status.js
   ```

---

## Production Considerations

1. **Security**:
   - Use HTTPS in production
   - Set strong JWT secrets
   - Implement proper rate limiting
   - Validate all inputs

2. **Performance**:
   - Use Redis for caching
   - Implement database indexing
   - Use CDN for static assets
   - Monitor API performance

3. **Monitoring**:
   - Set up logging
   - Monitor error rates
   - Track user analytics
   - Set up alerts

4. **Scalability**:
   - Use load balancers
   - Implement microservices
   - Use message queues
   - Database sharding -->
