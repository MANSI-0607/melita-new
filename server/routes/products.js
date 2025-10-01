import express from 'express';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getCategories,
  getRelatedProducts,
  getProductFilters,
  getProductFaqBySlug,
  getProductIDfromslug
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/filters', getProductFilters);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
// Place slug FAQ route before generic :id route to avoid conflicts
router.get('/slug/:slug/faq', getProductFaqBySlug);
router.get('/slug/:slug', getProductIDfromslug);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

export default router;
