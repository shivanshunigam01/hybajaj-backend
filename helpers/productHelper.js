const Category = require('../models/Category');
const { uploadFile } = require('../services/media.service');

const BOOL = (v) => v === true || v === 'true' || v === '1';

const parseImageUrlsField = (raw) => {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return s.split(',').map((x) => x.trim()).filter(Boolean);
};

const parseProductBody = (body = {}) => {
  const out = {};
  const strings = [
    'name',
    'slug',
    'category',
    'tag',
    'tagline',
    'description',
    'status',
    'brochureUrl',
    'seoTitle',
    'seoDescription',
  ];
  for (const key of strings) {
    if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== '') {
      out[key] = String(body[key]).trim();
    }
  }
  if (body.exShowroomPrice !== undefined && body.exShowroomPrice !== '') {
    out.exShowroomPrice = Number(body.exShowroomPrice);
  }
  if (body.emiFrom !== undefined && body.emiFrom !== '') {
    out.emiFrom = Number(body.emiFrom);
  }
  if (body.inventoryCount !== undefined && body.inventoryCount !== '') {
    out.inventoryCount = Number(body.inventoryCount);
  }
  if (body.isFeatured !== undefined) {
    out.isFeatured = BOOL(body.isFeatured);
  }
  if (body.colors !== undefined) {
    out.colors = parseImageUrlsField(body.colors);
  }
  return out;
};

const uploadProductImages = async (files, userId) => {
  const imageUrls = [];
  if (!files?.length) return imageUrls;
  for (const file of files) {
    const media = await uploadFile(file, {
      folder: 'products',
      entityType: 'product',
      userId,
    });
    imageUrls.push(media.url);
  }
  return imageUrls;
};

const resolveCategoryId = async (categorySlug) => {
  if (!categorySlug) return undefined;
  const category = await Category.findOne({ slug: categorySlug, isDeleted: false }).select('_id').lean();
  return category?._id;
};

const buildImageUrlsForSave = async ({ body, files, userId, existingUrls = [] }) => {
  const uploaded = await uploadProductImages(files, userId);
  if (body.imageUrls !== undefined) {
    const kept = parseImageUrlsField(body.imageUrls);
    return [...kept, ...uploaded];
  }
  if (uploaded.length) {
    return [...(existingUrls || []), ...uploaded];
  }
  return undefined;
};

module.exports = {
  parseProductBody,
  parseImageUrlsField,
  uploadProductImages,
  resolveCategoryId,
  buildImageUrlsForSave,
};
