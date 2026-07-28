const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
  {
    metric: String,
    muzaffarpur: mongoose.Schema.Types.Mixed,
    sheohar: mongoose.Schema.Types.Mixed,
    paroo: mongoose.Schema.Types.Mixed,
    karza: mongoose.Schema.Types.Mixed,
    total: mongoose.Schema.Types.Mixed,
    targetStandard: String,
    gap: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const mbrSnapshotSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true },
    metrics: [metricSchema],
    generatedAt: { type: Date, default: Date.now },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MbrSnapshot', mbrSnapshotSchema);
