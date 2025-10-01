import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getUserAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getAddress,
  validatePincode,
  getAddressSuggestions
} from '../controllers/addressController.js';

const router = express.Router();

// All address routes require authentication
router.use(authenticateToken);

// Address management
router.get('/', getUserAddresses);
router.get('/default', getDefaultAddress);
router.get('/validate/:pincode', validatePincode);
router.get('/suggestions', getAddressSuggestions);

router.post('/', createAddress);
router.get('/:addressId', getAddress);
router.put('/:addressId', updateAddress);
router.patch('/:addressId/default', setDefaultAddress);
router.delete('/:addressId', deleteAddress);

export default router;
