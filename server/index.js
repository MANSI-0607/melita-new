import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from './config/db.js';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import profileRoutes from './routes/profile.js';
import addressRoutes from './routes/addresses.js';
import rewardRoutes from './routes/rewards.js';
import reviewRoutes from './routes/reviews.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import couponRoutes from './routes/coupons.js';
import sellerRoutes from './routes/sellers.js';
import { fileURLToPath } from "url";

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Security headers; allow cross-origin resource policy so images load from different origin (e.g., Vite dev server)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan("dev"));

// CORS setup
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:5173"]; // Defaults for local dev

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Serve uploaded assets (e.g., review images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.json({ 
    message: "Melita E-commerce API", 
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      products: "/products",
      orders: "/orders",
      profile: "/profile",
      addresses: "/addresses",
      rewards: "/rewards",
      reviews: "/reviews",
      coupons: "/coupons",
      sellers: "/sellers",
      admin: "/admin"
    }
  });
});

// Test endpoint for token validation (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.get("/test-token", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const TOKEN_SECRET = process.env.JWT_SECRET || 'melita_dev_secret';
      const decoded = jwt.verify(token, TOKEN_SECRET);
      res.json({ success: true, decoded });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ success: false, error: error.message });
    }
  });
}

// API Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/profile', profileRoutes);
app.use('/addresses', addressRoutes);
app.use('/rewards', rewardRoutes);
app.use('/reviews', reviewRoutes);
app.use('/coupons', couponRoutes);

app.use('/checkout', checkoutRoutes);
app.use('/admin', adminRoutes);
app.use('/sellers', sellerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
