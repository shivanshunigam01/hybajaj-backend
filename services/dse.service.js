const DseDailyEntry = require('../models/DseDailyEntry');
const OutletFunnel = require('../models/OutletFunnel');
const BranchScorecard = require('../models/BranchScorecard');
const FinanceCase = require('../models/FinanceCase');
const LeadSourceRoi = require('../models/LeadSourceRoi');
const WeeklyReviewAction = require('../models/WeeklyReviewAction');
const MbrSnapshot = require('../models/MbrSnapshot');
const SetupMasters = require('../models/SetupMasters');
const { nextCode } = require('../helpers/codeHelper');
const { parseListQuery, buildMeta } = require('../helpers/queryHelper');
const { calcProductivityScore, pct, agingDays, healthForAchievement } = require('../utils/dseMath');
const { AppError } = require('../utils/AppError');
const { sendCampaign } = require('./whatsapp.service');
const aisensy = require('../config/aisensy');

const withDerivedFunnel = (row) => {
  const o = row.toObject ? row.toObject() : row;
  return {
    ...o,
    leadToRetailPct: pct(o.retail, o.freshEnquiries),
    trToBookingPct: pct(o.bookings, o.testRides),
    financeApprovalPct: pct(o.financeApprovals, o.financeLogins),
    achievementPct: pct(o.retail, o.targetRetail),
  };
};

const withDerivedRoi = (row) => {
  const o = row.toObject ? row.toObject() : row;
  return {
    ...o,
    cpl: o.leads ? o.spend / o.leads : 0,
    cpb: o.bookings ? o.spend / o.bookings : 0,
    cpr: o.retail ? o.spend / o.retail : 0,
    leadToRetailPct: pct(o.retail, o.leads),
  };
};

const getDashboard = async ({ month, branch = 'All' }) => {
  const funnelFilter = { isDeleted: false };
  if (month) funnelFilter.month = month;
  if (branch && branch !== 'All') funnelFilter.branch = branch;

  const funnels = await OutletFunnel.find(funnelFilter);
  const dseFilter = { isDeleted: false };
  if (branch && branch !== 'All') dseFilter.branch = branch;
  const dseRows = await DseDailyEntry.find(dseFilter).sort({ date: -1 }).limit(50);
  const weeklyFilter = {
    isDeleted: false,
    status: { $in: ['Open', 'In Progress'] },
  };
  if (branch && branch !== 'All') weeklyFilter.branch = branch;
  const openActions = await WeeklyReviewAction.countDocuments(weeklyFilter);

  const target = funnels.reduce((s, r) => s + r.targetRetail, 0);
  const retail = funnels.reduce((s, r) => s + r.retail, 0);
  const fresh = funnels.reduce((s, r) => s + r.freshEnquiries, 0);
  const testRides = funnels.reduce((s, r) => s + r.testRides, 0);
  const bookings = funnels.reduce((s, r) => s + r.bookings, 0);
  const financeApprovals = funnels.reduce((s, r) => s + r.financeApprovals, 0);
  const achievement = pct(retail, target);
  const leadRetail = pct(retail, fresh);
  const avgScore = dseRows.length
    ? dseRows.reduce((s, r) => s + r.productivityScore, 0) / dseRows.length
    : 0;

  const scoreFilter = { isDeleted: false };
  if (branch && branch !== 'All') scoreFilter.branch = branch;
  const scorecards = await BranchScorecard.find(scoreFilter);

  return {
    month: month || null,
    branch,
    kpis: [
      { key: 'totalRetail', value: retail, targetRef: target, health: healthForAchievement(achievement) },
      { key: 'achievementPct', value: achievement, targetRef: 0.85, health: healthForAchievement(achievement) },
      { key: 'freshEnquiries', value: fresh, health: 'Active' },
      { key: 'testRides', value: testRides, health: 'Active' },
      { key: 'bookings', value: bookings, health: 'Active' },
      { key: 'financeApprovals', value: financeApprovals, health: 'Active' },
      {
        key: 'leadToRetailPct',
        value: leadRetail,
        targetRef: 0.1,
        health: leadRetail >= 0.1 ? 'On Track' : 'Gap',
      },
      {
        key: 'avgDseScore',
        value: Number(avgScore.toFixed(2)),
        targetRef: 75,
        health: avgScore >= 75 ? 'On Track' : 'Gap',
      },
      {
        key: 'openReviewActions',
        value: openActions,
        targetRef: 0,
        health: openActions === 0 ? 'On Track' : 'Pending',
      },
    ],
    branchScoreboard: scorecards.map((r) => ({
      branch: r.branch,
      target: r.monthlyRetailTarget,
      retail: r.currentRetail,
      achievementPct: pct(r.currentRetail, r.monthlyRetailTarget),
      focus: r.strategicFocus,
    })),
    dseProductivity: dseRows.map((r) => ({
      dseName: r.dseName,
      branch: r.branch,
      freshContacts: r.freshContacts,
      testRides: r.testRides,
      retail: r.retail,
      productivityScore: r.productivityScore,
    })),
  };
};

const listDaily = async (query) => {
  const { page, limit, skip, sort, q } = parseListQuery(query);
  const filter = { isDeleted: false };
  if (query.branch) filter.branch = query.branch;
  if (query.dseName) filter.dseName = query.dseName;
  if (query.date) filter.date = new Date(query.date);
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = new Date(query.from);
    if (query.to) filter.date.$lte = new Date(query.to);
  }
  if (q) {
    filter.$or = [
      { territory: new RegExp(q, 'i') },
      { remarks: new RegExp(q, 'i') },
      { dseName: new RegExp(q, 'i') },
    ];
  }
  const [data, total] = await Promise.all([
    DseDailyEntry.find(filter).sort(sort).skip(skip).limit(limit),
    DseDailyEntry.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
};

const createDaily = async (body, userId) => {
  const entryCode = await nextCode(DseDailyEntry, { prefix: 'DD-', field: 'entryCode', pad: 3 });
  const productivityScore = calcProductivityScore(body);
  return DseDailyEntry.create({
    ...body,
    entryCode,
    productivityScore,
    createdBy: userId,
  });
};

const updateDaily = async (id, body) => {
  const doc = await DseDailyEntry.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError('Entry not found', 404);
  Object.assign(doc, body);
  doc.productivityScore = calcProductivityScore(doc);
  await doc.save();
  return doc;
};

const deleteDaily = async (id) => {
  const doc = await DseDailyEntry.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError('Entry not found', 404);
  doc.isDeleted = true;
  await doc.save();
  return doc;
};

const listFunnels = async (query) => {
  const filter = { isDeleted: false };
  if (query.month) filter.month = query.month;
  if (query.branch) filter.branch = query.branch;
  const rows = await OutletFunnel.find(filter).sort({ branch: 1 });
  return rows.map(withDerivedFunnel);
};

const upsertFunnel = async (body) => {
  const doc = await OutletFunnel.findOneAndUpdate(
    { month: body.month, branch: body.branch },
    { ...body, isDeleted: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return withDerivedFunnel(doc);
};

const listScorecards = async (query) => {
  const filter = { isDeleted: false };
  if (query.branch) filter.branch = query.branch;
  return BranchScorecard.find(filter).sort({ branch: 1 });
};

const upsertScorecard = async (branch, body) =>
  BranchScorecard.findOneAndUpdate(
    { branch },
    { ...body, branch, isDeleted: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const listFinanceCases = async (query) => {
  const { page, limit, skip, sort, q } = parseListQuery(query);
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.branch) filter.branch = query.branch;
  if (query.dse) filter.dse = query.dse;
  if (query.agingMin) filter.agingDays = { $gte: Number(query.agingMin) };
  if (q) {
    filter.$or = [
      { customerName: new RegExp(q, 'i') },
      { mobile: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
      { caseCode: new RegExp(q, 'i') },
    ];
  }
  const [data, total] = await Promise.all([
    FinanceCase.find(filter).sort(sort).skip(skip).limit(limit),
    FinanceCase.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
};

const createFinanceCase = async (body, userId) => {
  const caseCode = await nextCode(FinanceCase, { prefix: 'FN-', field: 'caseCode', pad: 3 });
  return FinanceCase.create({
    ...body,
    caseCode,
    date: body.date || body.loginDate,
    agingDays: agingDays(body.loginDate),
    createdBy: userId,
  });
};

const updateFinanceCase = async (id, body) => {
  const doc = await FinanceCase.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError('Finance case not found', 404);
  Object.assign(doc, body);
  doc.agingDays = agingDays(doc.loginDate);
  await doc.save();
  return doc;
};

const listRoi = async (query) => {
  const filter = { isDeleted: false };
  if (query.month) filter.month = query.month;
  if (query.branch) filter.branch = query.branch;
  if (query.leadSource) filter.leadSource = query.leadSource;
  const rows = await LeadSourceRoi.find(filter).sort({ createdAt: -1 });
  return rows.map(withDerivedRoi);
};

const createRoi = async (body) => LeadSourceRoi.create(body);
const updateRoi = async (id, body) => {
  const doc = await LeadSourceRoi.findOneAndUpdate(
    { _id: id, isDeleted: false },
    body,
    { new: true }
  );
  if (!doc) throw new AppError('ROI row not found', 404);
  return withDerivedRoi(doc);
};
const deleteRoi = async (id) => {
  const doc = await LeadSourceRoi.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError('ROI row not found', 404);
  doc.isDeleted = true;
  await doc.save();
  return doc;
};

const listWeekly = async (query) => {
  const { page, limit, skip, sort } = parseListQuery(query);
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.branch) filter.branch = query.branch;
  if (query.weekStart) filter.weekStart = new Date(query.weekStart);
  if (query.escalationNeeded === 'true') filter.escalationNeeded = true;
  if (query.escalationNeeded === 'false') filter.escalationNeeded = false;
  const [data, total] = await Promise.all([
    WeeklyReviewAction.find(filter).sort(sort).skip(skip).limit(limit),
    WeeklyReviewAction.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
};

const createWeekly = async (body, userId) => {
  const actionCode = await nextCode(WeeklyReviewAction, {
    prefix: 'WR-',
    field: 'actionCode',
    pad: 3,
  });
  const doc = await WeeklyReviewAction.create({ ...body, actionCode, createdBy: userId });
  if (doc.escalationNeeded) {
    await sendCampaign({
      campaignName: aisensy.campaigns.escalation,
      destination: process.env.WHATSAPP_ADMIN || '919031038262',
      templateParams: [doc.branch, doc.reviewPoint, doc.owner, String(doc.deadline).slice(0, 10)],
    });
  }
  return doc;
};

const updateWeekly = async (id, body) => {
  const doc = await WeeklyReviewAction.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError('Action not found', 404);
  if (body.status === 'Closed' && !body.closureComment && !doc.closureComment) {
    throw new AppError('closureComment required when closing', 400);
  }
  Object.assign(doc, body);
  await doc.save();
  return doc;
};

const getMbr = async (month) => {
  if (month) {
    const snap = await MbrSnapshot.findOne({ month });
    if (snap) return snap;
  }
  const funnels = await OutletFunnel.find({ isDeleted: false, ...(month ? { month } : {}) });
  const byBranch = Object.fromEntries(funnels.map((f) => [f.branch, f]));
  const pick = (field) => ({
    muzaffarpur: byBranch.Muzaffarpur?.[field] ?? 0,
    sheohar: byBranch.Sheohar?.[field] ?? 0,
    paroo: byBranch.Paroo?.[field] ?? 0,
    karza: byBranch.Karza?.[field] ?? 0,
  });
  const sum = (o) => o.muzaffarpur + o.sheohar + o.paroo + o.karza;
  const retail = pick('retail');
  const target = pick('targetRetail');
  const fresh = pick('freshEnquiries');
  return {
    month: month || null,
    metrics: [
      { metric: 'Retail Target', ...target, total: sum(target), targetStandard: '', gap: '' },
      { metric: 'Actual Retail', ...retail, total: sum(retail), targetStandard: '', gap: '' },
      {
        metric: 'Achievement %',
        muzaffarpur: pct(retail.muzaffarpur, target.muzaffarpur),
        sheohar: pct(retail.sheohar, target.sheohar),
        paroo: pct(retail.paroo, target.paroo),
        karza: pct(retail.karza, target.karza),
        total: pct(sum(retail), sum(target)),
        targetStandard: '85%+',
        gap: '',
      },
      { metric: 'Fresh Enquiries', ...fresh, total: sum(fresh), targetStandard: '', gap: '' },
    ],
  };
};

const saveMbrSnapshot = async (month, userId) => {
  const data = await getMbr(month);
  return MbrSnapshot.findOneAndUpdate(
    { month },
    { month, metrics: data.metrics, generatedAt: new Date(), generatedBy: userId },
    { upsert: true, new: true }
  );
};

const DEFAULT_MASTERS = {
  branches: ['Muzaffarpur', 'Sheohar', 'Paroo', 'Karza'],
  dses: ['DSE 1', 'DSE 2', 'DSE 3', 'DSE 4', 'DSE 5'],
  models: [
    'CT 110X',
    'Platina',
    'Pulsar 125',
    'Pulsar N160',
    'Pulsar NS125',
    'Pulsar NS160',
    'Pulsar NS200',
    'Avenger',
    'Dominar',
  ],
  leadSources: [
    'Walk-in',
    'Digital',
    'Field Activity',
    'Referral',
    'Database',
    'Exchange',
    'Finance Partner',
    'Event/BTL',
    'Organic',
  ],
  statuses: ['Open', 'Contacted', 'Hot'],
  yesNo: ['Yes', 'No'],
  priorities: ['High', 'Medium', 'Low'],
  financeStatuses: [
    'Login Pending',
    'Approved',
    'Rejected',
    'Disbursed',
    'Documentation Pending',
  ],
  reviewStatuses: ['Open', 'In Progress', 'Closed', 'Hold'],
};

const getMasters = async () => {
  let doc = await SetupMasters.findOne({ key: 'default' });
  if (!doc) doc = await SetupMasters.create({ key: 'default', ...DEFAULT_MASTERS });
  return doc;
};

const addMasterValue = async (key, value) => {
  const allowed = Object.keys(DEFAULT_MASTERS);
  if (!allowed.includes(key)) throw new AppError('Invalid master key', 400);
  const doc = await getMasters();
  const list = doc[key] || [];
  if (list.some((v) => v.toLowerCase() === value.toLowerCase())) {
    throw new AppError('Value already exists', 409);
  }
  doc[key] = [...list, value.trim()];
  await doc.save();
  return doc;
};

const removeMasterValue = async (key, value) => {
  const doc = await getMasters();
  if (!doc[key]) throw new AppError('Invalid master key', 400);
  doc[key] = doc[key].filter((v) => v !== value);
  await doc.save();
  return doc;
};

module.exports = {
  getDashboard,
  listDaily,
  createDaily,
  updateDaily,
  deleteDaily,
  listFunnels,
  upsertFunnel,
  listScorecards,
  upsertScorecard,
  listFinanceCases,
  createFinanceCase,
  updateFinanceCase,
  listRoi,
  createRoi,
  updateRoi,
  deleteRoi,
  listWeekly,
  createWeekly,
  updateWeekly,
  getMbr,
  saveMbrSnapshot,
  getMasters,
  addMasterValue,
  removeMasterValue,
};
