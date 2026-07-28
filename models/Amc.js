const mongoose = require('mongoose');

const amcPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true },
    benefits: [String],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const amcSubscriptionSchema = new mongoose.Schema(
  {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'AmcPlan', required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleReg: String,
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  AmcPlan: mongoose.model('AmcPlan', amcPlanSchema),
  AmcSubscription: mongoose.model('AmcSubscription', amcSubscriptionSchema),
};
