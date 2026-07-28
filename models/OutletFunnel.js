const mongoose = require('mongoose');
const { BRANCH_NAMES } = require('../config/constants');

const outletFunnelSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true },
    targetRetail: { type: Number, default: 0 },
    openingProspects: { type: Number, default: 0 },
    freshEnquiries: { type: Number, default: 0 },
    qualified: { type: Number, default: 0 },
    followUpsDone: { type: Number, default: 0 },
    testRides: { type: Number, default: 0 },
    financeLogins: { type: Number, default: 0 },
    financeApprovals: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    retail: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    keyGap: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

outletFunnelSchema.index({ month: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('OutletFunnel', outletFunnelSchema);
