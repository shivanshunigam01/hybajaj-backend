const mongoose = require('mongoose');
const { LEAD_STAGES, LEAD_SOURCES, INTERESTS } = require('../config/constants');

const noteSchema = new mongoose.Schema(
  {
    text: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    leadCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true, maxlength: 500 },
    model: String,
    interest: { type: String, enum: INTERESTS },
    source: { type: String, enum: LEAD_SOURCES, default: 'Website' },
    stage: { type: String, enum: LEAD_STAGES, default: 'New' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    message: { type: String, maxlength: 2000 },
    notes: [noteSchema],
    utm: { type: mongoose.Schema.Types.Mixed },
    pageUrl: String,
    verifiedPhone: { type: Boolean, default: false },
    whatsappOptIn: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

leadSchema.index({ phone: 1, createdAt: -1 });
leadSchema.index({ stage: 1, branchId: 1 });
leadSchema.index({ isDeleted: 1, createdAt: -1 });
leadSchema.index({ isDeleted: 1, stage: 1, updatedAt: -1 });
leadSchema.index({ name: 'text', phone: 'text', message: 'text', leadCode: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
