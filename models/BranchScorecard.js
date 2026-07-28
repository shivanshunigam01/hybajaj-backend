const mongoose = require('mongoose');
const { BRANCH_NAMES } = require('../config/constants');

const branchScorecardSchema = new mongoose.Schema(
  {
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true, unique: true },
    strategicFocus: { type: String, required: true },
    monthlyRetailTarget: { type: Number, default: 0 },
    currentRetail: { type: Number, default: 0 },
    freshEnquiries: { type: Number, default: 0 },
    testRides: { type: Number, default: 0 },
    financeApprovals: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    fieldActivities: { type: Number, default: 0 },
    referralLeads: { type: Number, default: 0 },
    topLeakage: String,
    correctiveAction: String,
    owner: { type: String, required: true },
    month: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BranchScorecard', branchScorecardSchema);
