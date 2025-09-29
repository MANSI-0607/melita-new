# Melita E-commerce Backend API

A comprehensive, production-ready backend API for Melita skincare e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Security
- ✅ OTP-based authentication with phone numbers
- ✅ JWT token-based authorization
- ✅ Rate limiting for OTP requests and verification
- ✅ Input validation and sanitization
- ✅ CORS protection

### Product Management
- ✅ Product catalog with categories and filtering
- ✅ Advanced search functionality
- ✅ Product ratings and reviews system
- ✅ Inventory management
- ✅ SEO-optimized product data

### Order Management
- ✅ Complete order lifecycle management
- ✅ Order status tracking
- ✅ Payment integration ready
- ✅ Shipping address management
- ✅ Order cancellation and refunds

### User Management
- ✅ User profile management
- ✅ Address book functionality
- ✅ Notification preferences
- ✅ Account security features

### Reward System
- ✅ Points-based loyalty program
- ✅ Referral system
- ✅ Cashback and discounts
- ✅ Loyalty tiers (Bronze, Silver, Gold, Platinum)
- ✅ Transaction history

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── productController.js  # Product business logic
│   ├── orderController.js    # Order management
│   ├── profileController.js  # User profile management
│   ├── addressController.js  # Address management
│   └── rewardController.js   # Rewards and loyalty
├── middleware/
│   └── authMiddleware.js     # Authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   ├── Order.js             # Order schema
│   ├── Address.js           # Address schema
│   └── Transaction.js       # Transaction schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   ├── orders.js            # Order routes
│   ├── profile.js           # Profile routes
│   ├── addresses.js         # Address routes
│   └── rewards.js           # Reward routes
├── index.js                 # Main server file
├── seedData.js              # Database seeder
├── setup.js                 # Environment setup
├── check-status.js          # Server health check
└── test_auth.js             # Authentication testing
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Install
```bash
cd server
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Environment Variables
```env
# Required
JWT_SECRET=your_super_secret_jwt_key_here
MONGO_URI=mongodb://localhost:27017/melita
PORT=5000

# Optional - SMS Service (Fast2SMS)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_SENDER_ID=MELITA
FAST2SMS_TEMPLATE_ID=your_template_id_here
FAST2SMS_ROUTE=otp

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Seed Database (Optional)
```bash
node seedData.js
```

### 6. Start Server
```bash
npm start
```

### 7. Test Server
```bash
node check-status.js
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
All protected routes require JWT token:
```
Authorization: Bearer <jwt_token>
```

### Main Endpoints
- **Authentication**: `/auth`
- **Products**: `/products`
- **Orders**: `/orders`
- **Profile**: `/profile`
- **Addresses**: `/addresses`
- **Rewards**: `/rewards`

For complete API documentation, see [ECOMMERCE_API_DOCUMENTATION.md](./ECOMMERCE_API_DOCUMENTATION.md)

## 🧪 Testing

### Test Authentication Flow
```bash
node test_auth.js
```

### Test Server Health
```bash
node check-status.js
```

### Manual Testing Examples

#### 1. Send OTP for Signup
```bash
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "name": "Test User",
    "type": "signup"
  }'
```

#### 2. Verify OTP
```bash
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "123456",
    "type": "signup"
  }'
```

#### 3. Get Products
```bash
curl http://localhost:5000/products?page=1&limit=10
```

## 🔧 Development

### Scripts
```bash
npm start          # Start server with nodemon
npm test           # Run tests (when implemented)
```

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Use meaningful variable names
- Add proper error handling
- Include JSDoc comments for complex functions

### Database Schema
All models include:
- Proper validation
- Indexes for performance
- Virtual fields for computed properties
- Pre/post middleware hooks
- Static methods for common queries

## 🚀 Production Deployment

### Environment Setup
1. Set strong JWT secrets
2. Use production MongoDB instance
3. Configure proper CORS origins
4. Set up SMS service credentials
5. Enable HTTPS

### Security Considerations
- Use environment variables for secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Regular security audits

### Performance Optimization
- Use Redis for caching
- Implement database indexing
- Use CDN for static assets
- Monitor API performance
- Set up logging and monitoring

### Scaling
- Use load balancers
- Implement microservices
- Use message queues
- Database sharding
- Horizontal scaling

## 📊 Database Models

### User Model
- Personal information
- Authentication data
- Reward points and loyalty
- Preferences and settings

### Product Model
- Product details and pricing
- Images and media
- Inventory management
- SEO and metadata

### Order Model
- Order items and pricing
- Shipping and billing
- Payment information
- Status tracking

### Address Model
- User addresses
- Validation and formatting
- Default address management

### Transaction Model
- Reward point transactions
- Cashback tracking
- Referral bonuses
- Point expiration

## 🎁 Reward System

### Earning Points
- **Purchase**: 1 point per ₹1 spent
- **Referral**: 500 points when friend makes first purchase
- **Review**: 50 points per verified product review
- **Birthday**: 1000 points (if date added)

### Loyalty Tiers
- **Bronze**: Default tier
- **Silver**: ₹10,000+ spent (5% discount, 1.2x points)
- **Gold**: ₹25,000+ spent (10% discount, 1.5x points, free shipping)
- **Platinum**: ₹50,000+ spent (15% discount, 2x points, free shipping)

### Redeeming Points
- Minimum redemption: 100 points
- 1 point = ₹1 discount
- Points can be used for orders

## 🔒 Security Features

- OTP-based authentication
- JWT token authorization
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Password hashing (bcryptjs)

## 📈 Monitoring & Logging

- Morgan HTTP request logging
- Error logging with stack traces
- Performance monitoring ready
- Database query optimization
- API response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the code comments
- Test with the provided scripts
- Create an issue for bugs

## 🔄 Version History

- **v1.0.0**: Initial release with complete e-commerce functionality
  - OTP authentication
  - Product management
  - Order processing
  - Reward system
  - Address management
  - User profiles

---

**Built with ❤️ for Melita Skincare**
