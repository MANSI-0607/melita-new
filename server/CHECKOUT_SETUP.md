<!-- # Checkout System Setup Guide

## Overview
This checkout system provides a complete e-commerce checkout experience with:
- Address management
- Shipping options
- Payment processing (Razorpay + COD)
- Coupon system
- Super coins/rewards
- Order management

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the server directory with:

```env
# Database
MONGO_URI=mongodb://localhost:27017/melita

# JWT
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173

# Razorpay (Get these from Razorpay Dashboard)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Razorpay Setup
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create a new account or login
3. Go to Settings > API Keys
4. Generate API keys
5. Add the keys to your `.env` file

### 3. Database Models
The following models are required:
- `User` - User accounts with reward points
- `Address` - User shipping addresses
- `Coupon` - Discount coupons
- `Order` - Order management
- `Transaction` - Reward/coin transactions

### 4. API Endpoints

#### Address Management
- `GET /checkout/addresses` - Get user addresses
- `POST /checkout/addresses` - Add new address

#### Coupons
- `GET /checkout/coupons` - Get available coupons
- `POST /checkout/coupons/apply` - Apply coupon

#### Orders
- `POST /checkout/orders` - Create COD order
- `POST /checkout/orders/razorpay` - Create Razorpay order
- `POST /checkout/orders/verify-payment` - Verify Razorpay payment

### 5. Frontend Integration

#### Cart Context
The checkout page uses the `CartContext` for:
- Cart items management
- Total calculations
- Cart persistence

#### Checkout Flow
1. **Address Selection** - Choose or add shipping address
2. **Shipping Method** - Select delivery option
3. **Payment** - Choose Razorpay or COD
4. **Order Confirmation** - Success/failure handling

### 6. Features

#### Address Management
- Save multiple addresses
- Set default address
- Address validation

#### Coupon System
- Fixed amount discounts
- Percentage discounts
- Usage limits
- User-specific and global coupons

#### Super Coins
- Earn coins on purchases (20% cashback)
- Use coins for discounts (max 99% of order)
- Balance tracking

#### Payment Options
- **Razorpay**: Cards, UPI, Netbanking, Wallets
- **COD**: Cash on Delivery

### 7. Testing

#### Test the checkout flow:
1. Add items to cart
2. Go to `/checkout`
3. Select/add address
4. Choose shipping method
5. Apply coupons/coins (optional)
6. Select payment method
7. Complete order

#### Test Razorpay:
- Use test mode for development
- Test cards: 4111 1111 1111 1111
- Test UPI: any valid UPI ID

### 8. Production Considerations

#### Security
- Validate all inputs
- Use HTTPS in production
- Secure API keys
- Rate limiting

#### Performance
- Database indexing
- Caching strategies
- Image optimization

#### Monitoring
- Order tracking
- Payment failures
- User analytics

## Troubleshooting

### Common Issues

1. **Razorpay not loading**
   - Check if script is loaded in HTML
   - Verify API keys
   - Check console for errors

2. **Cart not persisting**
   - Check localStorage
   - Verify CartContext setup
   - Check for JavaScript errors

3. **Payment failures**
   - Check Razorpay configuration
   - Verify webhook setup
   - Check server logs

4. **Address not saving**
   - Check authentication
   - Verify API endpoints
   - Check database connection

### Debug Tips

1. **Check browser console** for JavaScript errors
2. **Check server logs** for API errors
3. **Verify network requests** in browser dev tools
4. **Test with different browsers** for compatibility

## Support

For issues or questions:
1. Check the console logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity -->
