import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

dotenv.config();

const TOKEN_SECRET = process.env.JWT_SECRET || 'melita_dev_secret';

function createToken(payload) {
  console.log('Creating token with secret:', TOKEN_SECRET);
  console.log('Token payload:', payload);
  const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '7d' });
  console.log('Created token:', token);
  return token;
}

// Helper: normalize and validate phone
function validatePhone(phone) {
  const normalizedPhone = (phone || '').replace(/\D/g, '');
  if (normalizedPhone.length < 10 || normalizedPhone.length > 13) {
    return { valid: false, error: 'Invalid phone number' };
  }
  return { valid: true, phone: normalizedPhone };
}

// Helper: verify attempts rate limiting
async function checkVerifyRateLimit(user) {
  const now = new Date();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 5;

  if (!user.otpVerifyWindowStart || now - user.otpVerifyWindowStart > WINDOW_MS) {
    user.otpVerifyWindowStart = now;
    user.otpVerifyAttempts = 0;
  }

  if ((user.otpVerifyAttempts || 0) >= MAX_ATTEMPTS) {
    return { allowed: false, message: 'Too many verification attempts. Try again later.' };
  }

  return { allowed: true };
}

export async function sendOtp(req, res) {
  try {
    const { phone, name, type = 'signup', addedBy } = req.body || {};
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Validate phone number
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ message: phoneValidation.error });
    }
    const normalizedPhone = phoneValidation.phone;

    // Check if user exists
    let user = await User.findOne({ phone: normalizedPhone });

    // For login, user must exist
    if (type === 'login') {
      if (!user) {
        return res.status(404).json({
          message: 'No account found with this phone number. Please sign up first.'
        });
      }
    }

    // For signup, user should not exist
    if (type === 'signup') {
      if (user) {
        return res.status(409).json({
          message: 'Account already exists with this phone number. Please login instead.'
        });
      }
      // Create new user for signup
      const toCreate = { phone: normalizedPhone, name: name || '' };
      if (addedBy && (addedBy.name || addedBy.phone)) {
        toCreate.addedBy = {
          name: addedBy.name || '',
          phone: addedBy.phone || ''
        };
      }
      user = await User.create(toCreate);
    }

    // For signup, if name is provided, update it
    if (type === 'signup' && name && user.name !== name) {
      user.name = name;
      // Update addedBy post-create if provided
      if (addedBy && (addedBy.name || addedBy.phone)) {
        user.addedBy = {
          name: addedBy.name || user.addedBy?.name || '',
          phone: addedBy.phone || user.addedBy?.phone || ''
        };
      }
      await user.save();
    }

    // Generate OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Rate limiting: 30s cooldown
    const now = new Date();
    const COOLDOWN_MS = 30 * 1000;
    if (user.lastOtpSentAt && now - user.lastOtpSentAt < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - user.lastOtpSentAt)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSec} seconds before requesting another OTP`
      });
    }

    // Rate limiting: max 5 per hour
    const WINDOW_MS = 60 * 60 * 1000;
    if (!user.otpSendWindowStart || now - user.otpSendWindowStart > WINDOW_MS) {
      user.otpSendWindowStart = now;
      user.otpSendCount = 0;
    }
    const MAX_SENDS_PER_WINDOW = 8;
    if ((user.otpSendCount || 0) >= MAX_SENDS_PER_WINDOW) {
      return res.status(429).json({
        message: 'Too many OTP requests. Please try again in an hour.'
      });
    }

    // Save OTP info
    user.otpCode = otp;
    user.otpExpires = expires;
    user.lastOtpSentAt = now;
    user.otpSendCount = (user.otpSendCount || 0) + 1;
    await user.save();

    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
    if (!FAST2SMS_API_KEY) {
      console.log(`DEV MODE: OTP for ${normalizedPhone}: ${otp}`);
      return res.json({
        message: 'OTP sent successfully (dev mode)',
        success: true,
        devOtp: otp,
      });
    }

    // Fast2SMS API Call using query string method
    const apiKey = FAST2SMS_API_KEY;
    const templateId = process.env.FAST2SMS_TEMPLATE_ID_LOGIN;

    const queryParams = new URLSearchParams({
      authorization: apiKey,
      route: 'dlt',
      sender_id: 'MELITA',
      message: templateId,
      variables_values: `${otp}|5`, // OTP and validity minutes (5 minutes)
      numbers: normalizedPhone,
      flash: '0',
    });

    const smsUrl = `https://www.fast2sms.com/dev/bulkV2?${queryParams.toString()}`;

    try {
      await axios.get(smsUrl, { timeout: 10000 });
      return res.json({ message: 'OTP sent successfully via SMS', success: true });
    } catch (smsErr) {
      const status = smsErr?.response?.status;
      const data = smsErr?.response?.data;
      const message = typeof data === 'object' ? (data?.message || JSON.stringify(data)) : (data || smsErr?.message);

      const statusCodeFromBody = (typeof data === 'object' && data?.status_code) ? Number(data.status_code) : undefined;
      const isDevIpBlocked = status === 414 || statusCodeFromBody === 414 || (typeof message === 'string' && message.toLowerCase().includes('blacklisted'));

      if (isDevIpBlocked) {
        console.warn('Fast2SMS dev API IP blocked. Falling back to DEV OTP delivery.');
        console.log(`DEV MODE (fallback): OTP for ${normalizedPhone}: ${otp}`);
        return res.json({ message: 'OTP sent successfully (dev mode fallback)', success: true, devOtp: otp });
      }

      console.error('Fast2SMS send error:', message);
      return res.status(502).json({ message: 'Failed to send OTP via SMS. Please try again.' });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, otp, type = 'signup' } = req.body || {};

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ message: phoneValidation.error });
    }
    const normalizedPhone = phoneValidation.phone;

    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please request OTP again.' });
    }

    const rateLimitCheck = await checkVerifyRateLimit(user);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ message: rateLimitCheck.message });
    }

    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: 'No valid OTP found. Please request a new OTP.' });
    }

    if (new Date() > user.otpExpires) {
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otpCode !== otp) {
      user.otpVerifyAttempts = (user.otpVerifyAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP valid
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpVerifyAttempts = 0;
    user.otpVerifyWindowStart = undefined;
    user.isVerified = true;
    await user.save();

    const token = createToken({ userId: user._id, name: user.name, phone: user.phone });

    return res.json({
      message: type === 'signup' ? 'Account created successfully!' : 'Login successful!',
      success: true,
      token,
      user: { id: user._id, name: user.name, phone: user.phone }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
}

export function getProfile(req, res) {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        isVerified: req.user.isVerified,
        rewardPoints: req.user.rewardPoints,
        loyaltyTier: req.user.loyaltyTier,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
