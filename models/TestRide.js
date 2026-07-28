const mongoose = require('mongoose');
const { TEST_RIDE_SLOTS } = require('../config/constants');

const testRideSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    model: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    preferredDate: { type: Date, required: true },
    timeSlot: { type: String, enum: [...TEST_RIDE_SLOTS, null], default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'no_show', 'cancelled', 'converted'],
      default: 'pending',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleRegAllocated: String,
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackText: String,
    consentWhatsApp: { type: Boolean, required: true },
    notes: String,
    convertedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

testRideSchema.index({ preferredDate: 1, branchId: 1, timeSlot: 1 });

module.exports = mongoose.model('TestRide', testRideSchema);
