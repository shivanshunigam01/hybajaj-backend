const mongoose = require('mongoose');
const { BRANCH_NAMES } = require('../config/constants');

const dseDailySchema = new mongoose.Schema(
  {
    entryCode: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true },
    dseName: { type: String, required: true },
    dseUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    territory: String,
    freshContacts: { type: Number, default: 0, min: 0 },
    followUpCalls: { type: Number, default: 0, min: 0 },
    qualifiedEnquiries: { type: Number, default: 0, min: 0 },
    testRides: { type: Number, default: 0, min: 0 },
    financeProspects: { type: Number, default: 0, min: 0 },
    bookings: { type: Number, default: 0, min: 0 },
    retail: { type: Number, default: 0, min: 0 },
    referralRequests: { type: Number, default: 0, min: 0 },
    hotProspects: { type: Number, default: 0, min: 0 },
    crmUpdated: { type: Boolean, default: false },
    productivityScore: { type: Number, default: 0, min: 0, max: 100 },
    remarks: String,
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

dseDailySchema.index({ date: 1, branch: 1, dseName: 1 });

module.exports = mongoose.model('DseDailyEntry', dseDailySchema);
