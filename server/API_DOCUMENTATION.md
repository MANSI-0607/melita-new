# Melita Authentication API Documentation

## Overview
This document describes the authentication API endpoints for the Melita application. The system uses OTP-based authentication with phone numbers.

## Base URL
```
http://localhost:5000/auth
```

## Environment Variables Required
```env
JWT_SECRET=your_jwt_secret_key
FAST2SMS_API_KEY=your_fast2sms_api_key
FAST2SMS_SENDER_ID=MELITA
FAST2SMS_TEMPLATE_ID=your_template_id (optional)
FAST2SMS_ROUTE=otp (or dlt)
MONGO_URI=your_mongodb_connection_string
```

## Endpoints

### 1. Send OTP
**POST** `/send-otp`

Sends an OTP to the provided phone number for either login or signup.

#### Request Body
```json
{
  "phone": "string (required)",
  "name": "string (optional, required for signup)",
  "type": "string (optional, 'signup' or 'login', default: 'signup')"
}
```

#### Response Success (200)
```json
{
  "message": "OTP sent successfully via SMS",
  "success": true
}
```

#### Response Errors
- **400 Bad Request**: Invalid phone number or missing required fields
- **404 Not Found**: User not found (for login)
- **409 Conflict**: User already exists (for signup)
- **429 Too Many Requests**: Rate limit exceeded

#### Rate Limiting
- 30-second cooldown between OTP requests
- Maximum 5 OTP requests per hour per phone number

### 2. Verify OTP
**POST** `/verify-otp`

Verifies the OTP and completes the authentication process.

#### Request Body
```json
{
  "phone": "string (required)",
  "otp": "string (required)",
  "type": "string (optional, 'signup' or 'login', default: 'signup')"
}
```

#### Response Success (200)
```json
{
  "message": "Account created successfully!" | "Login successful!",
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "name": "user_name",
    "phone": "user_phone"
  }
}
```

#### Response Errors
- **400 Bad Request**: Invalid OTP, expired OTP, or missing fields
- **404 Not Found**: User not found
- **429 Too Many Requests**: Too many verification attempts

#### Rate Limiting
- Maximum 5 verification attempts per 15-minute window

### 3. Get User Profile
**GET** `/profile`

Retrieves the authenticated user's profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response Success (200)
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "user_name",
    "phone": "user_phone",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Response Errors
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Account deactivated
- **404 Not Found**: User not found

## Authentication Flow

### Signup Flow
1. **Send OTP for Signup**
   ```
   POST /auth/send-otp
   {
     "phone": "+1234567890",
     "name": "John Doe",
     "type": "signup"
   }
   ```

2. **Verify OTP**
   ```
   POST /auth/verify-otp
   {
     "phone": "+1234567890",
     "otp": "123456",
     "type": "signup"
   }
   ```

3. **Use JWT Token**
   ```
   GET /auth/profile
   Authorization: Bearer <jwt_token>
   ```

### Login Flow
1. **Send OTP for Login**
   ```
   POST /auth/send-otp
   {
     "phone": "+1234567890",
     "type": "login"
   }
   ```

2. **Verify OTP**
   ```
   POST /auth/verify-otp
   {
     "phone": "+1234567890",
     "otp": "123456",
     "type": "login"
   }
   ```

3. **Use JWT Token**
   ```
   GET /auth/profile
   Authorization: Bearer <jwt_token>
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "success": false
}
```

Common error codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource not found)
- **409**: Conflict (resource already exists)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error (server error)

## Security Features

1. **Rate Limiting**: Prevents abuse of OTP sending and verification
2. **JWT Tokens**: Secure authentication tokens with 7-day expiration
3. **Phone Validation**: Validates phone number format
4. **OTP Expiration**: OTPs expire after 5 minutes
5. **Account Status**: Support for account activation/deactivation
6. **User Verification**: Tracks if users have verified their phone numbers

## Development Mode

When `FAST2SMS_API_KEY` is not set, the system runs in development mode:
- OTPs are logged to console instead of being sent via SMS
- Useful for testing without SMS costs

## Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure MongoDB connection is stable
3. **SMS Provider**: Configure Fast2SMS with proper template and sender ID
4. **Rate Limiting**: Monitor and adjust rate limits as needed
5. **Logging**: Implement proper logging for production monitoring
6. **HTTPS**: Use HTTPS in production for secure communication
