const mongoose = require('mongoose');

const setupMastersSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    branches: { type: [String], default: [] },
    dses: { type: [String], default: [] },
    models: { type: [String], default: [] },
    leadSources: { type: [String], default: [] },
    statuses: { type: [String], default: [] },
    yesNo: { type: [String], default: ['Yes', 'No'] },
    priorities: { type: [String], default: [] },
    financeStatuses: { type: [String], default: [] },
    reviewStatuses: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SetupMasters', setupMastersSchema);
