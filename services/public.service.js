const Branch = require('../models/Branch');
const Product = require('../models/Product');
const TestRide = require('../models/TestRide');
const FinanceApplication = require('../models/FinanceApplication');
const Settings = require('../models/Settings');
const ExchangeRequest = require('../models/ExchangeRequest');
const ServiceBooking = require('../models/ServiceBooking');
const LicenceRequest = require('../models/LicenceRequest');
const { TrainingCourse, TrainingBatch, TrainingEnrollment } = require('../models/Training');
const { AmcPlan, AmcSubscription } = require('../models/Amc');
const { createLead } = require('./lead.service');
const { nextCode } = require('../helpers/codeHelper');
const { normalizePhone, isValidIndianMobile } = require('../utils/phone');
const { calcEmi } = require('../utils/dseMath');
const { AppError } = require('../utils/AppError');
const { testRideConfirmEmail, productInterestWelcomeEmail, leadAdminEmail } = require('./email.service');
const { sendTestRideConfirm, sendProductInterestWelcome, sendNewLeadAlert } = require('./whatsapp.service');
const { runInBackground } = require('../utils/background');
const dayjs = require('dayjs');

const PRODUCT_LIST_SELECT =
  'name slug category tag tagline description exShowroomPrice emiFrom colors imageUrls brochureUrl isFeatured status';

const BRANCH_LIST_SELECT =
  'name code type address city state pincode phone whatsapp hours geo';

const INTEREST_BY_CATEGORY = {
  motorcycle: 'New motorcycle',
  electric: 'Chetak Electric',
  three_wheeler: 'Three-wheeler / commercial',
};

const getPublicSettings = async () => {
  let settings = await Settings.findOne({ key: 'default' })
    .select('website seo contact social')
    .lean();
  if (!settings) {
    settings = await Settings.create({ key: 'default' });
    settings = settings.toObject();
  }
  return {
    website: settings.website,
    seo: settings.seo,
    contact: {
      consumerPhone: settings.contact?.consumerPhone,
      commercialPhone: settings.contact?.commercialPhone,
      whatsappPrimary: settings.contact?.whatsappPrimary,
    },
    social: settings.social,
  };
};

const listPublicBranches = async () =>
  Branch.find({ isDeleted: false, isActive: true })
    .select(BRANCH_LIST_SELECT)
    .sort({ type: 1, name: 1 })
    .lean();

const listPublicProducts = async (query = {}) => {
  const filter = { isDeleted: false, status: 'published' };
  if (query.category) filter.category = query.category;
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.q) filter.name = new RegExp(query.q, 'i');
  return Product.find(filter)
    .select(PRODUCT_LIST_SELECT)
    .sort({ isFeatured: -1, name: 1 })
    .lean();
};

const getPublicProduct = async (slug) => {
  const product = await Product.findOne({ slug, isDeleted: false, status: 'published' }).lean();
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const submitContact = async (body) => {
  if (!isValidIndianMobile(body.phone)) throw new AppError('Invalid phone', 400);
  const lead = await createLead({
    name: body.name,
    phone: body.phone,
    email: body.email,
    interest: body.interest,
    message: body.message,
    source: body.source || 'Website',
    pageUrl: body.pageUrl,
    utm: { utmSource: body.utmSource, utmCampaign: body.utmCampaign },
    stage: 'New',
  });
  return { id: lead._id, leadId: lead.leadCode, stage: lead.stage };
};

const submitProductInterest = async (body) => {
  if (!isValidIndianMobile(body.phone)) throw new AppError('Invalid contact number', 400);
  if (!isValidIndianMobile(body.whatsapp)) throw new AppError('Invalid WhatsApp number', 400);
  if (!body.model || !String(body.model).trim()) throw new AppError('Product model is required', 400);
  if (!body.address || String(body.address).trim().length < 5) {
    throw new AppError('Address is required', 400);
  }

  const interest =
    body.interest || INTEREST_BY_CATEGORY[body.category] || 'New motorcycle';

  const lead = await createLead(
    {
      name: body.name,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email || undefined,
      address: String(body.address).trim(),
      model: String(body.model).trim(),
      interest,
      message:
        body.message ||
        `Product interest: ${String(body.model).trim()} · Address: ${String(body.address).trim()}`,
      source: 'Product Enquiry',
      pageUrl: body.pageUrl,
      utm: { utmSource: body.utmSource, utmCampaign: body.utmCampaign },
      stage: 'New',
      whatsappOptIn: true,
      priority: 'High',
    },
    { notify: false }
  );

  runInBackground('product-interest-notify', () =>
    Promise.allSettled([
      leadAdminEmail(lead),
      productInterestWelcomeEmail(lead),
      sendProductInterestWelcome(lead),
      sendNewLeadAlert(lead),
    ])
  );

  return { id: lead._id, leadId: lead.leadCode, stage: lead.stage };
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugifyBranchCode = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || `branch-${Date.now()}`;

/** Resolve Mongo branch from branchId or Our Branches preferredBranch label. */
const resolveBookingBranch = async (body) => {
  if (body.branchId) {
    const byId = await Branch.findById(body.branchId);
    if (byId && !byId.isDeleted) return byId;
  }

  const preferred = String(body.preferredBranch || '').trim();
  if (!preferred) throw new AppError('Preferred branch is required', 400);

  const exact = await Branch.findOne({
    isDeleted: false,
    name: new RegExp(`^${escapeRegex(preferred)}$`, 'i'),
  });
  if (exact) return exact;

  const partialKey = preferred.split(/[·|—-]/)[0].trim();
  if (partialKey) {
    const partial = await Branch.findOne({
      isDeleted: false,
      name: new RegExp(escapeRegex(partialKey), 'i'),
    });
    if (partial) return partial;
  }

  const code = slugifyBranchCode(preferred);
  const isCommercial = /three|3w|sales|saraiya service|bhagwanpur|bakhari|kanti|khabra/i.test(
    preferred
  );

  return Branch.findOneAndUpdate(
    { code },
    {
      $setOnInsert: {
        name: preferred,
        code,
        type: isCommercial ? 'commercial' : 'consumer',
        address: `${preferred}, Muzaffarpur`,
        city: 'Muzaffarpur',
        state: 'Bihar',
        phone: '9031082228',
        hours: '9:30 AM - 7:00 PM',
        isActive: true,
        isDeleted: false,
      },
    },
    { upsert: true, new: true }
  );
};

const bookTestRide = async (body) => {
  if (!isValidIndianMobile(body.phone)) throw new AppError('Invalid phone', 400);
  if (!body.consentWhatsApp) throw new AppError('WhatsApp consent is required', 400);
  const branch = await resolveBookingBranch(body);
  if (!branch || branch.isDeleted) throw new AppError('Invalid branch', 400);
  if (dayjs(body.preferredDate).isBefore(dayjs().startOf('day'))) {
    throw new AppError('Date must be today or in the future', 400);
  }

  const lead = await createLead({
    name: body.fullName,
    phone: body.phone,
    model: body.model,
    interest: 'New motorcycle',
    source: 'Website',
    stage: 'Assigned',
    branchId: branch._id,
    whatsappOptIn: true,
    message: `Test ride request: ${body.model} at ${branch.name} on ${body.preferredDate} ${body.timeSlot || ''}`,
  });

  const bookingCode = await nextCode(TestRide, { prefix: 'TR-', field: 'bookingCode', pad: 4 });
  const booking = await TestRide.create({
    bookingCode,
    fullName: body.fullName,
    phone: normalizePhone(body.phone),
    model: body.model,
    branchId: branch._id,
    preferredDate: body.preferredDate,
    timeSlot: body.timeSlot || null,
    consentWhatsApp: true,
    leadId: lead._id,
    notes: body.notes || `Preferred branch: ${body.preferredBranch || branch.name}`,
  });

  runInBackground('test-ride-notify', () =>
    Promise.allSettled([testRideConfirmEmail(booking, branch), sendTestRideConfirm(booking)])
  );

  return {
    id: booking._id,
    bookingCode: booking.bookingCode,
    status: booking.status,
    leadId: lead.leadCode,
  };
};

const calculateEmi = (body) => {
  const emi = calcEmi(body.vehiclePrice, body.downPayment, body.tenureMonths, body.interestRate);
  const principal = Number(body.vehiclePrice) - Number(body.downPayment);
  const totalPayable = emi * Number(body.tenureMonths);
  return {
    emi,
    totalInterest: Math.max(0, totalPayable - principal),
    totalPayable,
  };
};

const applyFinance = async (body) => {
  if (!isValidIndianMobile(body.phone || body.customer?.phone)) {
    throw new AppError('Invalid phone', 400);
  }
  const phone = body.phone || body.customer.phone;
  const name = body.customerName || body.customer?.name;
  const computed = calculateEmi(body);
  const lead = await createLead({
    name,
    phone,
    email: body.email || body.customer?.email,
    model: body.model,
    interest: 'Finance & EMI',
    source: 'Website',
    stage: 'New',
    message: `Finance apply EMI ₹${computed.emi}`,
  });
  const applicationCode = await nextCode(FinanceApplication, {
    prefix: 'FA-',
    field: 'applicationCode',
    pad: 4,
  });
  const app = await FinanceApplication.create({
    applicationCode,
    customerName: name,
    phone: normalizePhone(phone),
    email: body.email || body.customer?.email,
    model: body.model,
    vehiclePrice: body.vehiclePrice,
    downPayment: body.downPayment,
    tenureMonths: body.tenureMonths,
    interestRate: body.interestRate,
    computedEmi: computed.emi,
    preferredPartner: body.preferredPartner,
    leadId: lead._id,
    branchId: body.branchId,
  });
  return app;
};

const submitExchange = async (body, photoUrls = []) => {
  if (!isValidIndianMobile(body.phone)) throw new AppError('Invalid phone', 400);
  const lead = await createLead({
    name: body.name,
    phone: body.phone,
    interest: 'Exchange valuation',
    source: 'Website',
    stage: 'New',
    message: `Exchange ${body.make} ${body.model}`,
  });
  const exchangeCode = await nextCode(ExchangeRequest, { prefix: 'EX-', field: 'exchangeCode', pad: 3 });
  const doc = await ExchangeRequest.create({
    exchangeCode,
    name: body.name,
    phone: normalizePhone(body.phone),
    make: body.make,
    model: body.model,
    year: body.year,
    rcNumber: body.rcNumber,
    photoUrls,
    leadId: lead._id,
    offerValidUntil: dayjs().add(7, 'day').toDate(),
  });
  return {
    id: doc._id,
    exchangeCode: doc.exchangeCode,
    status: doc.status,
    photoUrls: doc.photoUrls,
  };
};

const bookService = async (body) => {
  const lead = await createLead({
    name: body.customerName,
    phone: body.phone,
    interest: 'Service booking',
    source: 'Website',
    stage: 'New',
    model: body.model,
  });
  const bookingCode = await nextCode(ServiceBooking, { prefix: 'SV-', field: 'bookingCode', pad: 4 });
  return ServiceBooking.create({
    ...body,
    bookingCode,
    phone: normalizePhone(body.phone),
    leadId: lead._id,
    isEmergency: body.serviceType === 'emergency',
  });
};

const enrolTraining = async (body) => {
  const batch = await TrainingBatch.findById(body.batchId);
  if (!batch) throw new AppError('Batch not found', 404);
  const lead = await createLead({
    name: body.name,
    phone: body.phone,
    interest: 'Driving training',
    source: 'Website',
    stage: 'New',
  });
  const enrollment = await TrainingEnrollment.create({
    batchId: batch._id,
    name: body.name,
    phone: normalizePhone(body.phone),
    leadId: lead._id,
  });
  batch.enrolledCount += 1;
  await batch.save();
  return enrollment;
};

const submitLicence = async (body) => {
  const lead = await createLead({
    name: body.name,
    phone: body.phone,
    interest: 'Licence assistance',
    source: 'Website',
    stage: 'New',
  });
  return LicenceRequest.create({
    type: body.type,
    name: body.name,
    phone: normalizePhone(body.phone),
    leadId: lead._id,
  });
};

const listCourses = () =>
  TrainingCourse.find({ isDeleted: false, isActive: true })
    .select('name description fee durationDays batchTiming isActive')
    .lean();
const listAmcPlans = () =>
  AmcPlan.find({ isDeleted: false, isActive: true })
    .select('name price durationMonths benefits isActive')
    .lean();

const subscribeAmc = async (body) => {
  const plan = await AmcPlan.findById(body.planId);
  if (!plan) throw new AppError('Plan not found', 404);
  const lead = await createLead({
    name: body.customerName,
    phone: body.phone,
    interest: 'Service booking',
    source: 'Website',
    stage: 'New',
    message: `AMC plan: ${plan.name}`,
  });
  return AmcSubscription.create({
    planId: plan._id,
    customerName: body.customerName,
    phone: normalizePhone(body.phone),
    vehicleReg: body.vehicleReg,
    endDate: dayjs().add(plan.durationMonths, 'month').toDate(),
    leadId: lead._id,
  });
};

module.exports = {
  getPublicSettings,
  listPublicBranches,
  listPublicProducts,
  getPublicProduct,
  submitContact,
  submitProductInterest,
  bookTestRide,
  calculateEmi,
  applyFinance,
  submitExchange,
  bookService,
  enrolTraining,
  submitLicence,
  listCourses,
  listAmcPlans,
  subscribeAmc,
};
