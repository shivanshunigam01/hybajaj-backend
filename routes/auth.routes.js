const express = require('express');
const ctrl = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { auth, superAdminOnly } = require('../middlewares/auth.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter');
const { loginValidator, registerValidator } = require('../validators/common.validators');
const { body } = require('express-validator');

const router = express.Router();

router.post('/login', authLimiter, loginValidator, validate, ctrl.login);
router.post('/register', auth, superAdminOnly, registerValidator, validate, ctrl.register);
router.post('/refresh', body('refreshToken').notEmpty(), validate, ctrl.refresh);
router.post('/logout', auth, ctrl.logout);
router.get('/me', auth, ctrl.me);
router.post('/forgot-password', authLimiter, body('email').isEmail(), validate, ctrl.forgotPassword);
router.post(
  '/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  validate,
  ctrl.resetPassword
);
router.post(
  '/change-password',
  auth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  ctrl.changePassword
);
router.patch('/profile', auth, ctrl.updateProfile);
router.post(
  '/otp/send',
  otpLimiter,
  body('phone').notEmpty(),
  body('purpose').isIn(['test_ride', 'lead_verify', 'login']),
  validate,
  ctrl.sendOtp
);
router.post(
  '/otp/verify',
  otpLimiter,
  body('phone').notEmpty(),
  body('otp').notEmpty(),
  body('purpose').isIn(['test_ride', 'lead_verify', 'login']),
  validate,
  ctrl.verifyOtp
);

module.exports = router;
