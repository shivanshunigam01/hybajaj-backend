const express = require('express');
const ctrl = require('../controllers/dse.controller');
const { auth, requireRoles } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { ROLES } = require('../config/constants');
const { body, param } = require('express-validator');

const router = express.Router();
router.use(auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.FINANCE));

router.get('/masters', ctrl.getMasters);
router.post(
  '/masters/:key',
  param('key').notEmpty(),
  body('value').notEmpty(),
  validate,
  ctrl.addMaster
);
router.delete('/masters/:key/:value', param('key').notEmpty(), param('value').notEmpty(), validate, ctrl.removeMaster);

module.exports = router;
