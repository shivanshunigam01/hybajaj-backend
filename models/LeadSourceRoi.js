const mongoose = require('mongoose');
const { BRANCH_NAMES } = require('../config/constants');

const leadSourceRoiSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true },
    leadSource: { type: String, required: true },
    campaign: { type: String, required: true },
    spend: { type: Number, default: 0, min: 0 },
    leads: { type: Number, default: 0, min: 0 },
    qualified: { type: Number, default: 0, min: 0 },
    testRides: { type: Number, default: 0, min: 0 },
    bookings: { type: Number, default: 0, min: 0 },
    retail: { type: Number, default: 0, min: 0 },
    notes: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

leadSourceRoiSchema.index({ month: 1, branch: 1, leadSource: 1 });

module.exports = mongoose.model('LeadSourceRoi', leadSourceRoiSchema);
