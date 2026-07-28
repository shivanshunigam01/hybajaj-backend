const publicService = require('../services/public.service');
const { uploadFile } = require('../services/media.service');
const { success } = require('../utils/apiResponse');

const contact = async (req, res, next) => {
  try {
    const data = await publicService.submitContact(req.body);
    return success(res, {
      status: 201,
      message: 'Message received. We will contact you within 2 business hours.',
      data,
    });
  } catch (e) {
    next(e);
  }
};

const productInterest = async (req, res, next) => {
  try {
    const data = await publicService.submitProductInterest(req.body);
    return success(res, {
      status: 201,
      message: 'Thank you! Your request is registered. We will contact you shortly.',
      data,
    });
  } catch (e) {
    next(e);
  }
};

const testRide = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      consentWhatsApp: req.body.consentWhatsApp === true || req.body.consentWhatsApp === 'true',
    };
    const data = await publicService.bookTestRide(body);
    return success(res, {
      status: 201,
      message: 'Test ride booked. Confirmation will arrive on WhatsApp.',
      data,
    });
  } catch (e) {
    next(e);
  }
};

const emiCalculate = async (req, res, next) => {
  try {
    const data = publicService.calculateEmi(req.body);
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const financeApply = async (req, res, next) => {
  try {
    const data = await publicService.applyFinance(req.body);
    return success(res, { status: 201, message: 'Finance application submitted', data });
  } catch (e) {
    next(e);
  }
};

const products = async (req, res, next) => {
  try {
    const data = await publicService.listPublicProducts(req.query);
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const productBySlug = async (req, res, next) => {
  try {
    const data = await publicService.getPublicProduct(req.params.slug);
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const branches = async (req, res, next) => {
  try {
    const data = await publicService.listPublicBranches();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const settings = async (req, res, next) => {
  try {
    const data = await publicService.getPublicSettings();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const exchange = async (req, res, next) => {
  try {
    const urls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const media = await uploadFile(file, { folder: 'exchange', entityType: 'exchange' });
        urls.push(media.url);
      }
    }
    const data = await publicService.submitExchange(req.body, urls);
    return success(res, { status: 201, message: 'Valuation request received', data });
  } catch (e) {
    next(e);
  }
};

const serviceBooking = async (req, res, next) => {
  try {
    const data = await publicService.bookService(req.body);
    return success(res, { status: 201, message: 'Service booking created', data });
  } catch (e) {
    next(e);
  }
};

const trainingEnroll = async (req, res, next) => {
  try {
    const data = await publicService.enrolTraining(req.body);
    return success(res, { status: 201, message: 'Enrolled', data });
  } catch (e) {
    next(e);
  }
};

const licence = async (req, res, next) => {
  try {
    const data = await publicService.submitLicence(req.body);
    return success(res, { status: 201, message: 'Licence request submitted', data });
  } catch (e) {
    next(e);
  }
};

const courses = async (req, res, next) => {
  try {
    const data = await publicService.listCourses();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const amcPlans = async (req, res, next) => {
  try {
    const data = await publicService.listAmcPlans();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const amcSubscribe = async (req, res, next) => {
  try {
    const data = await publicService.subscribeAmc(req.body);
    return success(res, { status: 201, message: 'AMC subscription created', data });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  contact,
  productInterest,
  testRide,
  emiCalculate,
  financeApply,
  products,
  productBySlug,
  branches,
  settings,
  exchange,
  serviceBooking,
  trainingEnroll,
  licence,
  courses,
  amcPlans,
  amcSubscribe,
};
