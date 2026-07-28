const express = require('express');
const ctrl = require('../controllers/dse.controller');
const { auth, requireRoles } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  dseDailyValidator,
  financeCaseValidator,
  weeklyValidator,
  idParam,
} = require('../validators/common.validators');
const { ROLES } = require('../config/constants');
const { body } = require('express-validator');

const router = express.Router();
const access = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.FINANCE];

router.use(auth, requireRoles(...access));

router.get('/dashboard', ctrl.dashboard);

router.get('/daily', ctrl.listDaily);
router.post('/daily', dseDailyValidator, validate, ctrl.createDaily);
router.patch('/daily/:id', idParam, validate, ctrl.updateDaily);
router.delete('/daily/:id', idParam, validate, ctrl.deleteDaily);

router.get('/outlet-funnels', ctrl.listFunnels);
router.put('/outlet-funnels', ctrl.upsertFunnel);

router.get('/scorecards', ctrl.listScorecards);
router.put('/scorecards/:branch', ctrl.upsertScorecard);

router.get('/finance-cases', ctrl.listFinance);
router.post('/finance-cases', financeCaseValidator, validate, ctrl.createFinance);
router.patch('/finance-cases/:id', idParam, validate, ctrl.updateFinance);

router.get('/lead-roi', ctrl.listRoi);
router.post('/lead-roi', ctrl.createRoi);
router.patch('/lead-roi/:id', idParam, validate, ctrl.updateRoi);
router.delete('/lead-roi/:id', idParam, validate, ctrl.deleteRoi);

router.get('/weekly-reviews', ctrl.listWeekly);
router.post('/weekly-reviews', weeklyValidator, validate, ctrl.createWeekly);
router.patch('/weekly-reviews/:id', idParam, validate, ctrl.updateWeekly);

router.get('/mbr', ctrl.getMbr);
router.post('/mbr/snapshots', body('month').notEmpty(), validate, ctrl.saveMbr);

module.exports = router;
