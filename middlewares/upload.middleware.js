const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/AppError');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.has(file.mimetype)) cb(null, true);
  else cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 12 },
});

module.exports = {
  uploadSingle: (field = 'file') => upload.single(field),
  uploadMultiple: (field = 'files', max = 10) => upload.array(field, max),
  uploadFields: (fields) => upload.fields(fields),
};
