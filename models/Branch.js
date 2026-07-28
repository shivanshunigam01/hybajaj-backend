const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['consumer', 'commercial', 'dse_outlet'],
      required: true,
    },
    address: { type: String, required: true },
    city: { type: String, default: 'Muzaffarpur' },
    state: { type: String, default: 'Bihar' },
    pincode: String,
    phone: { type: String, required: true },
    whatsapp: String,
    hours: { type: String, required: true },
    geo: { lat: Number, lng: Number },
    monthlyRetailTarget: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
