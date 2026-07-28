const mongoose = require('mongoose');
const { FINANCE_STATUSES, BRANCH_NAMES } = require('../config/constants');

const financeCaseSchema = new mongoose.Schema(
  {
    caseCode: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    model: { type: String, required: true },
    dse: { type: String, required: true },
    financePartner: { type: String, required: true },
    requiredDp: { type: Number, required: true, min: 0 },
    loginDate: { type: Date, required: true },
    status: { type: String, enum: FINANCE_STATUSES, required: true },
    rejectionReason: String,
    approvalAmount: { type: Number, default: null },
    disbursementDate: Date,
    retailDone: { type: Boolean, default: false },
    remarks: String,
    agingDays: { type: Number, default: 0 },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

financeCaseSchema.index({ status: 1, branch: 1 });
financeCaseSchema.index({ mobile: 1 });

module.exports = mongoose.model('FinanceCase', financeCaseSchema);
