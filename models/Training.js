const mongoose = require('mongoose');

const trainingCourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationHours: Number,
    fee: Number,
    womenOnlyBatchAvailable: { type: Boolean, default: false },
    description: String,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const trainingBatchSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingCourse', required: true },
    startDate: { type: Date, required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    capacity: { type: Number, default: 20 },
    enrolledCount: { type: Number, default: 0 },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const trainingEnrollmentSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingBatch', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
    attendance: [{ date: Date, present: Boolean }],
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const certificateSchema = new mongoose.Schema(
  {
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingEnrollment', required: true },
    certificateNo: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: String,
  },
  { timestamps: true }
);

module.exports = {
  TrainingCourse: mongoose.model('TrainingCourse', trainingCourseSchema),
  TrainingBatch: mongoose.model('TrainingBatch', trainingBatchSchema),
  TrainingEnrollment: mongoose.model('TrainingEnrollment', trainingEnrollmentSchema),
  Certificate: mongoose.model('Certificate', certificateSchema),
};
