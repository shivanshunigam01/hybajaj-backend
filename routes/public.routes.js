const express = require('express');
const ctrl = require('../controllers/public.controller');
const { validate } = require('../middlewares/validation.middleware');
const { publicFormLimiter } = require('../middlewares/rateLimiter');
const { contactValidator, productInterestValidator, testRideValidator } = require('../validators/common.validators');
const { uploadMultiple } = require('../middlewares/upload.middleware');
const { body } = require('express-validator');

const cmsCtrl = require('../controllers/cms.controller');

const router = express.Router();

router.get('/site', cmsCtrl.getPublicSite);

router.post('/contact', publicFormLimiter, contactValidator, validate, ctrl.contact);
router.post(
  '/product-interest',
  publicFormLimiter,
  productInterestValidator,
  validate,
  ctrl.productInterest
);
router.post('/test-rides', publicFormLimiter, testRideValidator, validate, ctrl.testRide);
router.post('/finance/emi-calculate', ctrl.emiCalculate);
router.post('/finance/apply', publicFormLimiter, ctrl.financeApply);
router.get('/products', ctrl.products);
router.get('/products/:slug', ctrl.productBySlug);
router.get('/branches', ctrl.branches);
router.get('/settings', ctrl.settings);
router.post('/exchange', publicFormLimiter, uploadMultiple('photos', 10), ctrl.exchange);
router.post('/service-bookings', publicFormLimiter, ctrl.serviceBooking);
router.get('/training/courses', ctrl.courses);
router.post('/training/enroll', publicFormLimiter, ctrl.trainingEnroll);
router.post('/licence-requests', publicFormLimiter, ctrl.licence);
router.get('/amc-plans', ctrl.amcPlans);
router.post(
  '/amc-subscriptions',
  publicFormLimiter,
  body('planId').isMongoId(),
  body('customerName').notEmpty(),
  body('phone').notEmpty(),
  validate,
  ctrl.amcSubscribe
);

module.exports = router;
