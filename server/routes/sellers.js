import express from 'express';
import {
  login,
  authenticateSeller,
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
  addCustomerSendOtp,
  addCustomerVerifyOtp,
  getCustomers,
  getCustomerCoupons,
  recordSaleSendOtp,
  recordSaleVerifyOtp,
  getOrders,
  getProducts
} from '../controllers/sellerController.js';

const router = express.Router();

// Route definitions using controller functions
router.post('/login', login);
router.get('/profile', authenticateSeller, getProfile);
router.put('/profile', authenticateSeller, updateProfile);
router.patch('/change-password', authenticateSeller, changePassword);
router.get('/dashboard-stats', authenticateSeller, getDashboardStats);
router.post('/add-customer/send-otp', authenticateSeller, addCustomerSendOtp);
router.post('/add-customer/verify-otp', authenticateSeller, addCustomerVerifyOtp);
router.get('/customers', authenticateSeller, getCustomers);
router.get('/customer-coupons/:customerId', authenticateSeller, getCustomerCoupons);
router.post('/record-sale/send-otp', authenticateSeller, recordSaleSendOtp);
router.post('/record-sale/verify-otp', authenticateSeller, recordSaleVerifyOtp);
router.get('/orders', authenticateSeller, getOrders);
router.get('/products', authenticateSeller, getProducts);

export default router;
