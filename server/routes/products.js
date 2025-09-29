import express from 'express';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getCategories,
  getRelatedProducts,
  getProductFilters
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/filters', getProductFilters);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

export default router;
