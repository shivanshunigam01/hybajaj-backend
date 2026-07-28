const mongoose = require('mongoose');
const { BRANCH_NAMES, REVIEW_STATUSES } = require('../config/constants');

const weeklyReviewSchema = new mongoose.Schema(
  {
    actionCode: { type: String, required: true, unique: true },
    weekStart: { type: Date, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branch: { type: String, enum: BRANCH_NAMES, required: true },
    reviewPoint: { type: String, required: true },
    rootCause: String,
    actionType: { type: String, required: true },
    actionRequired: { type: String, required: true },
    owner: { type: String, required: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date, required: true },
    status: { type: String, enum: REVIEW_STATUSES, default: 'Open' },
    impactMetric: String,
    closureComment: String,
    escalationNeeded: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

weeklyReviewSchema.index({ weekStart: 1, status: 1 });
weeklyReviewSchema.index({ escalationNeeded: 1 });

module.exports = mongoose.model('WeeklyReviewAction', weeklyReviewSchema);
