const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    folder: { type: String, required: true },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    resourceType: { type: String, default: 'image' },
    entityType: String,
    entityId: { type: mongoose.Schema.Types.ObjectId },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mediaSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('Media', mediaSchema);
