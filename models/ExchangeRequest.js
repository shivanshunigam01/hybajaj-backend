const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    exchangeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    variantName: String,
    year: Number,
    rcNumber: String,
    registrationNumber: String,
    insurance: String,
    kilometers: Number,
    photoUrls: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['submitted', 'docs_pending', 'inspection', 'offer_made', 'accepted', 'expired', 'rejected'],
      default: 'submitted',
    },
    offerAmount: Number,
    offerValidUntil: Date,
    inspectionNotes: String,
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
