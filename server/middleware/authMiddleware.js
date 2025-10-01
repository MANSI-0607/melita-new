// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const TOKEN_SECRET = process.env.JWT_SECRET || 'melita_dev_secret';

export const authenticateToken = async (req, res, next) => {
  try {
   
    const authHeader = req.headers.authorization;
 
    const token = authHeader && authHeader.split(' ')[1];
  

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);
    
    const user = await User.findById(decoded.userId).select('-otpCode -otpExpires -otpSendCount -otpVerifyAttempts');

    if (!user) {
    
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
     
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireVerifiedUser = async (req, res, next) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please verify your phone number.' 
      });
    }
    next();
  } catch (err) {
    console.error('Verification check error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Legacy export for backward compatibility
const protect = authenticateToken;
export default protect;