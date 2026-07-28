const dse = require('../services/dse.service');
const { success } = require('../utils/apiResponse');

const wrap =
  (fn, opts = {}) =>
  async (req, res, next) => {
    try {
      const data = await fn(req);
      return success(res, {
        status: opts.status || 200,
        message: opts.message || 'OK',
        data: data?.data !== undefined && data?.meta ? data.data : data,
        meta: data?.meta,
        pagination: data?.meta,
      });
    } catch (e) {
      next(e);
    }
  };

module.exports = {
  dashboard: wrap((req) => dse.getDashboard(req.query)),
  listDaily: wrap((req) => dse.listDaily(req.query)),
  createDaily: wrap((req) => dse.createDaily(req.body, req.user._id), {
    status: 201,
    message: 'Daily entry created',
  }),
  updateDaily: wrap((req) => dse.updateDaily(req.params.id, req.body), { message: 'Updated' }),
  deleteDaily: wrap((req) => dse.deleteDaily(req.params.id), { message: 'Deleted' }),
  listFunnels: wrap((req) => dse.listFunnels(req.query)),
  upsertFunnel: wrap((req) => dse.upsertFunnel(req.body), { message: 'Funnel saved' }),
  listScorecards: wrap((req) => dse.listScorecards(req.query)),
  upsertScorecard: wrap(
    (req) => dse.upsertScorecard(req.params.branchId || req.params.branch || req.body.branch, req.body),
    { message: 'Scorecard saved' }
  ),
  listFinance: wrap((req) => dse.listFinanceCases(req.query)),
  createFinance: wrap((req) => dse.createFinanceCase(req.body, req.user._id), {
    status: 201,
    message: 'Finance case created',
  }),
  updateFinance: wrap((req) => dse.updateFinanceCase(req.params.id, req.body), {
    message: 'Finance case updated',
  }),
  listRoi: wrap((req) => dse.listRoi(req.query)),
  createRoi: wrap((req) => dse.createRoi(req.body), { status: 201, message: 'Created' }),
  updateRoi: wrap((req) => dse.updateRoi(req.params.id, req.body), { message: 'Updated' }),
  deleteRoi: wrap((req) => dse.deleteRoi(req.params.id), { message: 'Deleted' }),
  listWeekly: wrap((req) => dse.listWeekly(req.query)),
  createWeekly: wrap((req) => dse.createWeekly(req.body, req.user._id), {
    status: 201,
    message: 'Action created',
  }),
  updateWeekly: wrap((req) => dse.updateWeekly(req.params.id, req.body), { message: 'Updated' }),
  getMbr: wrap((req) => dse.getMbr(req.query.month)),
  saveMbr: wrap((req) => dse.saveMbrSnapshot(req.body.month || req.query.month, req.user._id), {
    status: 201,
    message: 'MBR snapshot saved',
  }),
  getMasters: wrap(() => dse.getMasters()),
  addMaster: wrap((req) => dse.addMasterValue(req.params.key, req.body.value), {
    status: 201,
    message: 'Value added',
  }),
  removeMaster: wrap((req) => dse.removeMasterValue(req.params.key, req.params.value), {
    message: 'Value removed',
  }),
};
