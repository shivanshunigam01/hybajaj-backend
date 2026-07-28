const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { configureCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const Media = require('../models/Media');
const { AppError } = require('../utils/AppError');

const ensureLocalPublic = (relativePath) => {
  const full = path.join(__dirname, '..', 'public', relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  return full;
};

const processImage = async (filePath, { width = 1600 } = {}) => {
  const out = `${filePath}.processed.jpg`;
  await sharp(filePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(out);
  return out;
};

const uploadFile = async (file, { folder = 'misc', entityType, entityId, userId } = {}) => {
  if (!file) throw new AppError('File is required', 400);

  const rootFolder = process.env.CLOUDINARY_FOLDER || 'hybajaj';
  const targetFolder = `${rootFolder}/${folder}`;
  const isImage = (file.mimetype || '').startsWith('image/');
  let uploadPath = file.path;

  if (isImage && file.mimetype !== 'image/svg+xml') {
    uploadPath = await processImage(file.path);
  }

  let url;
  let publicId;
  let format = path.extname(file.originalname).replace('.', '');
  let bytes = file.size;
  let width;
  let height;
  let resourceType = isImage ? 'image' : file.mimetype === 'application/pdf' ? 'raw' : 'auto';

  if (isCloudinaryConfigured()) {
    const cloudinary = configureCloudinary();
    const result = await cloudinary.uploader.upload(uploadPath, {
      folder: targetFolder,
      resource_type: resourceType === 'raw' ? 'raw' : 'auto',
      unique_filename: true,
      overwrite: false,
    });
    url = result.secure_url;
    publicId = result.public_id;
    format = result.format || format;
    bytes = result.bytes || bytes;
    width = result.width;
    height = result.height;
    resourceType = result.resource_type;
  } else {
    const name = `${uuidv4()}${path.extname(file.originalname)}`;
    const rel = path.join('uploads', folder, name).replace(/\\/g, '/');
    const dest = ensureLocalPublic(rel);
    fs.copyFileSync(uploadPath, dest);
    url = `${process.env.API_BASE_URL || ''}/static/${rel}`;
    publicId = `local/${folder}/${name}`;
  }

  // cleanup temp
  try {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    if (uploadPath !== file.path && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
  } catch {
    /* ignore */
  }

  const media = await Media.create({
    url,
    publicId,
    folder: targetFolder,
    format,
    bytes,
    width,
    height,
    resourceType,
    entityType,
    entityId,
    uploadedBy: userId,
  });

  return media;
};

const deleteMedia = async (mediaId) => {
  const media = await Media.findById(mediaId);
  if (!media || media.isDeleted) throw new AppError('Media not found', 404);
  if (isCloudinaryConfigured() && !media.publicId.startsWith('local/')) {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.resourceType === 'raw' ? 'raw' : 'image',
    });
  }
  media.isDeleted = true;
  await media.save();
  return media;
};

module.exports = { uploadFile, deleteMedia, processImage };
