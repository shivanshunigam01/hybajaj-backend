const mongoose = require('mongoose');

const financeApplicationSchema = new mongoose.Schema(
  {
    applicationCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    model: String,
    vehiclePrice: { type: Number, required: true },
    downPayment: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    computedEmi: { type: Number, required: true },
    preferredPartner: String,
    status: {
      type: String,
      enum: ['New', 'In Review', 'Approved', 'Rejected', 'Disbursed'],
      default: 'New',
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinanceApplication', financeApplicationSchema);
