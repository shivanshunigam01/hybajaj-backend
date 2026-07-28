const Product = require('../models/Product');
const Category = require('../models/Category');
const TestRide = require('../models/TestRide');
const User = require('../models/User');
const Settings = require('../models/Settings');
const FinanceApplication = require('../models/FinanceApplication');
const ServiceBooking = require('../models/ServiceBooking');
const ExchangeRequest = require('../models/ExchangeRequest');
const LicenceRequest = require('../models/LicenceRequest');
const {
  TrainingCourse,
  TrainingBatch,
  TrainingEnrollment,
  Certificate,
} = require('../models/Training');
const { AmcPlan } = require('../models/Amc');
const { parseListQuery, buildMeta } = require('../helpers/queryHelper');
const { nextCode } = require('../helpers/codeHelper');
const { uploadFile, deleteMedia } = require('../services/media.service');
const { AppError } = require('../utils/AppError');
const { success } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');
const UserModel = require('../models/User');

const crudList = (Model, buildFilter = () => ({})) => async (req, res, next) => {
  try {
    const { page, limit, skip, sort, q } = parseListQuery(req.query);
    const filter = { isDeleted: false, ...buildFilter(req) };
    if (q && Model.schema.path('name')) filter.name = new RegExp(q, 'i');
    const [data, total] = await Promise.all([
      Model.find(filter).sort(sort).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    return success(res, { data, meta: buildMeta(total, page, limit), pagination: buildMeta(total, page, limit) });
  } catch (e) {
    next(e);
  }
};

const products = {
  list: crudList(Product, (req) => {
    const f = {};
    if (req.query.category) f.category = req.query.category;
    if (req.query.status) f.status = req.query.status;
    return f;
  }),
  create: async (req, res, next) => {
    try {
      const imageUrls = [];
      if (req.files?.length) {
        for (const file of req.files) {
          const media = await uploadFile(file, {
            folder: 'products',
            entityType: 'product',
            userId: req.user._id,
          });
          imageUrls.push(media.url);
        }
      }
      const data = await Product.create({
        ...req.body,
        exShowroomPrice: Number(req.body.exShowroomPrice),
        isFeatured: req.body.isFeatured === true || req.body.isFeatured === 'true',
        imageUrls,
        createdBy: req.user._id,
      });
      return success(res, { status: 201, message: 'Product created', data });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await Product.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true }
      );
      if (!data) throw new AppError('Product not found', 404);
      return success(res, { message: 'Product updated', data });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const data = await Product.findOne({ _id: req.params.id, isDeleted: false });
      if (!data) throw new AppError('Product not found', 404);
      data.isDeleted = true;
      data.deletedAt = new Date();
      await data.save();
      return success(res, { message: 'Product deleted', data });
    } catch (e) {
      next(e);
    }
  },
};

const categories = {
  list: async (req, res, next) => {
    try {
      const data = await Category.find({ isDeleted: false }).sort({ sortOrder: 1 });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = await Category.create(req.body);
      return success(res, { status: 201, message: 'Category created', data });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return success(res, { message: 'Updated', data });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
      return success(res, { message: 'Deleted', data: null });
    } catch (e) {
      next(e);
    }
  },
};

const testRides = {
  list: crudList(TestRide, (req) => {
    const f = {};
    if (req.query.status) f.status = req.query.status;
    if (req.query.branchId) f.branchId = req.query.branchId;
    return f;
  }),
  get: async (req, res, next) => {
    try {
      const data = await TestRide.findOne({ _id: req.params.id, isDeleted: false }).populate('branchId assignedTo leadId');
      if (!data) throw new AppError('Not found', 404);
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await TestRide.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true }
      );
      if (!data) throw new AppError('Not found', 404);
      return success(res, { message: 'Updated', data });
    } catch (e) {
      next(e);
    }
  },
  convert: async (req, res, next) => {
    try {
      const data = await TestRide.findOne({ _id: req.params.id, isDeleted: false });
      if (!data) throw new AppError('Not found', 404);
      data.status = 'converted';
      data.convertedAt = new Date();
      await data.save();
      if (data.leadId) {
        const Lead = require('../models/Lead');
        await Lead.findByIdAndUpdate(data.leadId, { stage: 'Booked' });
      }
      return success(res, { message: 'Converted', data });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await TestRide.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
      return success(res, { message: 'Deleted', data: null });
    } catch (e) {
      next(e);
    }
  },
};

const users = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip, sort, q } = parseListQuery(req.query);
      const filter = { isDeleted: false };
      if (req.query.role) filter.role = req.query.role;
      if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
      const [rows, total] = await Promise.all([
        User.find(filter).sort(sort).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);
      return success(res, {
        data: rows.map((u) => u.toSafeJSON()),
        meta: buildMeta(total, page, limit),
        pagination: buildMeta(total, page, limit),
      });
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
        throw new AppError('Forbidden', 403);
      }
      const passwordHash = await UserModel.hashPassword(req.body.password || 'ChangeMe1');
      const user = await User.create({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        passwordHash,
        role: req.body.role,
        branchIds: req.body.branchIds || [],
        dseCode: req.body.dseCode,
      });
      return success(res, { status: 201, message: 'User created', data: user.toSafeJSON() });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.params.id, isDeleted: false });
      if (!user) throw new AppError('User not found', 404);
      ['name', 'role', 'dseCode', 'isActive', 'avatarUrl'].forEach((k) => {
        if (req.body[k] !== undefined) user[k] = req.body[k];
      });
      if (req.body.branchIds) user.branchIds = req.body.branchIds;
      await user.save();
      return success(res, { message: 'Updated', data: user.toSafeJSON() });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date(), isActive: false });
      return success(res, { message: 'User deleted', data: null });
    } catch (e) {
      next(e);
    }
  },
};

const settings = {
  get: async (req, res, next) => {
    try {
      let doc = await Settings.findOne({ key: 'default' });
      if (!doc) doc = await Settings.create({ key: 'default' });
      const obj = doc.toObject();
      if (req.user.role !== ROLES.SUPER_ADMIN) {
        if (obj.smtp) obj.smtp.pass = obj.smtp.pass ? '********' : undefined;
        if (obj.whatsapp) obj.whatsapp.apiKey = obj.whatsapp.apiKey ? '********' : undefined;
        if (obj.payments) obj.payments.razorpayKeySecret = obj.payments.razorpayKeySecret ? '********' : undefined;
        if (obj.cloudinary) obj.cloudinary.apiSecret = obj.cloudinary.apiSecret ? '********' : undefined;
      }
      return success(res, { data: obj });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const doc = await Settings.findOneAndUpdate({ key: 'default' }, req.body, {
        upsert: true,
        new: true,
      });
      return success(res, { message: 'Settings updated', data: doc });
    } catch (e) {
      next(e);
    }
  },
};

const media = {
  upload: async (req, res, next) => {
    try {
      const data = await uploadFile(req.file, {
        folder: req.body.folder || 'misc',
        entityType: req.body.entityType,
        entityId: req.body.entityId,
        userId: req.user?._id,
      });
      return success(res, { status: 201, message: 'Uploaded', data });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const data = await deleteMedia(req.params.id);
      return success(res, { message: 'Deleted', data });
    } catch (e) {
      next(e);
    }
  },
};

const reports = {
  leads: async (req, res, next) => {
    try {
      const Lead = require('../models/Lead');
      const filter = { isDeleted: false };
      if (req.query.from) filter.createdAt = { ...(filter.createdAt || {}), $gte: new Date(req.query.from) };
      if (req.query.to) filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(req.query.to) };
      const data = await Lead.find(filter).sort({ createdAt: -1 }).limit(5000);
      return success(res, { data, message: 'Lead report' });
    } catch (e) {
      next(e);
    }
  },
  dseProductivity: async (req, res, next) => {
    try {
      const DseDailyEntry = require('../models/DseDailyEntry');
      const filter = { isDeleted: false };
      if (req.query.month) {
        // approximate by date string prefix not available — use from/to preferred
      }
      const data = await DseDailyEntry.find(filter).sort({ date: -1 }).limit(5000);
      return success(res, { data, message: 'DSE productivity report' });
    } catch (e) {
      next(e);
    }
  },
};

const financeApps = {
  list: crudList(FinanceApplication),
  get: async (req, res, next) => {
    try {
      const data = await FinanceApplication.findById(req.params.id);
      if (!data) throw new AppError('Not found', 404);
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await FinanceApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return success(res, { message: 'Updated', data });
    } catch (e) {
      next(e);
    }
  },
};

const adminExtras = {
  listService: crudList(ServiceBooking),
  updateService: async (req, res, next) => {
    try {
      const data = await ServiceBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  listExchange: crudList(ExchangeRequest),
  updateExchange: async (req, res, next) => {
    try {
      const data = await ExchangeRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  listLicence: crudList(LicenceRequest),
  updateLicence: async (req, res, next) => {
    try {
      const data = await LicenceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  listCourses: async (req, res, next) => {
    try {
      const data = await TrainingCourse.find({ isDeleted: false }).sort({ createdAt: 1 });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  createCourse: async (req, res, next) => {
    try {
      const name = req.body.name || req.body.title;
      const data = await TrainingCourse.create({
        ...req.body,
        name,
        title: req.body.title || name,
      });
      return success(res, { status: 201, data });
    } catch (e) {
      next(e);
    }
  },
  updateCourse: async (req, res, next) => {
    try {
      const patch = { ...req.body };
      if (patch.name && !patch.title) patch.title = patch.name;
      if (patch.title && !patch.name) patch.name = patch.title;
      const data = await TrainingCourse.findByIdAndUpdate(req.params.id, patch, { new: true });
      if (!data) throw new AppError('Course not found', 404);
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  createBatch: async (req, res, next) => {
    try {
      const data = await TrainingBatch.create(req.body);
      return success(res, { status: 201, data });
    } catch (e) {
      next(e);
    }
  },
  listEnrollments: async (req, res, next) => {
    try {
      const data = await TrainingEnrollment.find({ isDeleted: false })
        .populate('courseId', 'name title fee')
        .populate('batchId', 'startDate status')
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100)
        .lean();
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  updateEnrollment: async (req, res, next) => {
    try {
      const data = await TrainingEnrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!data) throw new AppError('Enrollment not found', 404);
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  issueCertificate: async (req, res, next) => {
    try {
      const certificateNo = await nextCode(Certificate, { prefix: 'CERT-', field: 'certificateNo', pad: 4 });
      const data = await Certificate.create({
        enrollmentId: req.body.enrollmentId,
        certificateNo,
        pdfUrl: req.body.pdfUrl,
      });
      return success(res, { status: 201, data });
    } catch (e) {
      next(e);
    }
  },
  listAmcPlans: async (req, res, next) => {
    try {
      const data = await AmcPlan.find({ isDeleted: false });
      return success(res, { data });
    } catch (e) {
      next(e);
    }
  },
  createAmcPlan: async (req, res, next) => {
    try {
      const data = await AmcPlan.create(req.body);
      return success(res, { status: 201, data });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = {
  products,
  categories,
  testRides,
  users,
  settings,
  media,
  reports,
  financeApps,
  adminExtras,
};
