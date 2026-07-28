const express = require('express');
const ctrl = require('../controllers/lead.controller');
const { auth, requireRoles } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { leadCreateValidator, idParam } = require('../validators/common.validators');
const { ROLES } = require('../config/constants');
const { body } = require('express-validator');
const { uploadSingle } = require('../middlewares/upload.middleware');

const router = express.Router();
const staff = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.SALES,
  ROLES.RECEPTION,
  ROLES.FINANCE,
];

router.use(auth, requireRoles(...staff));

router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.post('/', leadCreateValidator, validate, ctrl.create);
router.get('/:id', idParam, validate, ctrl.get);
router.patch('/:id', idParam, validate, ctrl.update);
router.post('/:id/assign', idParam, body('assignedTo').isMongoId(), validate, ctrl.assign);
router.post(
  '/:id/send-quotation',
  idParam,
  uploadSingle('file'),
  validate,
  ctrl.sendQuotation
);
router.delete('/:id', requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), idParam, validate, ctrl.remove);

module.exports = router;
