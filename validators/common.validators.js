const { body, param, query } = require('express-validator');
const { INTERESTS, LEAD_STAGES, FINANCE_STATUSES, REVIEW_STATUSES, BRANCH_NAMES, ROLES, TEST_RIDE_SLOTS } = require('../config/constants');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const registerValidator = [
  body('name').isLength({ min: 2, max: 80 }),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('password')
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .withMessage('Password needs uppercase')
    .matches(/[a-z]/)
    .withMessage('Password needs lowercase')
    .matches(/\d/)
    .withMessage('Password needs a number'),
  body('role').isIn(Object.values(ROLES)),
];

const contactValidator = [
  body('name').isLength({ min: 2, max: 80 }),
  body('phone').notEmpty(),
  body('email').optional({ nullable: true }).isEmail(),
  body('interest').isIn(INTERESTS),
  body('message').optional().isLength({ max: 2000 }),
];

const productInterestValidator = [
  body('name').isLength({ min: 2, max: 80 }),
  body('phone').notEmpty().withMessage('Contact number is required'),
  body('whatsapp').notEmpty().withMessage('WhatsApp number is required'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail(),
  body('address').isLength({ min: 5, max: 500 }).withMessage('Address is required'),
  body('model').notEmpty().withMessage('Product model is required'),
  body('category').optional().isIn(['motorcycle', 'electric', 'three_wheeler']),
  body('interest').optional().isIn(INTERESTS),
  body('message').optional().isLength({ max: 2000 }),
];

const testRideValidator = [
  body('fullName').isLength({ min: 2, max: 80 }),
  body('phone').notEmpty(),
  body('model').notEmpty(),
  body('branchId').isMongoId(),
  body('preferredDate').isISO8601(),
  body('timeSlot').optional().isIn(TEST_RIDE_SLOTS),
  body('consentWhatsApp')
    .custom((v) => v === true || v === 'true')
    .withMessage('WhatsApp consent is required'),
];

const leadCreateValidator = [
  body('name').isLength({ min: 2, max: 80 }),
  body('phone').notEmpty(),
  body('stage').optional().isIn(LEAD_STAGES),
];

const dseDailyValidator = [
  body('date').isISO8601(),
  body('branch').isIn(BRANCH_NAMES),
  body('dseName').notEmpty(),
  body('freshContacts').optional().isInt({ min: 0 }),
  body('crmUpdated').optional().isBoolean(),
];

const financeCaseValidator = [
  body('branch').isIn(BRANCH_NAMES),
  body('customerName').notEmpty(),
  body('mobile').notEmpty(),
  body('model').notEmpty(),
  body('dse').notEmpty(),
  body('financePartner').notEmpty(),
  body('requiredDp').isFloat({ min: 0 }),
  body('loginDate').isISO8601(),
  body('status').isIn(FINANCE_STATUSES),
];

const weeklyValidator = [
  body('weekStart').isISO8601(),
  body('branch').isIn(BRANCH_NAMES),
  body('reviewPoint').notEmpty(),
  body('actionType').notEmpty(),
  body('actionRequired').notEmpty(),
  body('owner').notEmpty(),
  body('deadline').isISO8601(),
  body('status').optional().isIn(REVIEW_STATUSES),
];

const idParam = [param('id').isMongoId()];
const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  loginValidator,
  registerValidator,
  contactValidator,
  productInterestValidator,
  testRideValidator,
  leadCreateValidator,
  dseDailyValidator,
  financeCaseValidator,
  weeklyValidator,
  idParam,
  paginationQuery,
};
