const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleCategory: {
      type: String,
      enum: ['two_wheeler', 'electric', 'three_wheeler'],
      default: 'two_wheeler',
    },
    vehicleReg: String,
    model: String,
    preferredBranch: String,
    serviceType: {
      type: String,
      enum: ['periodic', 'repair', 'emergency', 'amc'],
      default: 'periodic',
    },
    pickupRequired: { type: Boolean, default: false },
    preferredDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['open', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invoiceUrl: String,
    isEmergency: { type: Boolean, default: false },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    notes: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
