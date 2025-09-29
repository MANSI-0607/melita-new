import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import profileRoutes from './routes/profile.js';
import addressRoutes from './routes/addresses.js';
import rewardRoutes from './routes/rewards.js';
import reviewRoutes from './routes/reviews.js';
import simpleProductRoutes from './routes/simpleProducts.js';
import checkoutRoutes from './routes/checkout.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
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
      simpleProducts: "/api/products"
    }
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/profile', profileRoutes);
app.use('/addresses', addressRoutes);
app.use('/rewards', rewardRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/products', simpleProductRoutes);
app.use('/checkout', checkoutRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
