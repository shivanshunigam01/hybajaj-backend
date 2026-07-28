const mongoose = require('mongoose');

const licenceRequestSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['LL', 'DL', 'commercial'], required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ['submitted', 'docs_pending', 'facilitating', 'closed'],
      default: 'submitted',
    },
    rtoNotes: String,
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LicenceRequest', licenceRequestSchema);
