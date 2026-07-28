const Lead = require('../models/Lead');
const { nextCode } = require('../helpers/codeHelper');
const { parseListQuery, buildMeta } = require('../helpers/queryHelper');
const { normalizePhone } = require('../utils/phone');
const { AppError } = require('../utils/AppError');
const { leadAdminEmail, contactAckEmail, quotationEmail } = require('./email.service');
const { sendNewLeadAlert, sendQuotation } = require('./whatsapp.service');
const { uploadFile } = require('./media.service');

const createLead = async (payload, { notify = true, userId } = {}) => {
  const leadCode = await nextCode(Lead, { prefix: 'L-', field: 'leadCode', pad: 4 });
  const lead = await Lead.create({
    ...payload,
    leadCode,
    phone: normalizePhone(payload.phone),
    whatsapp: payload.whatsapp ? normalizePhone(payload.whatsapp) : undefined,
    createdBy: userId,
  });
  if (notify) {
    await Promise.allSettled([leadAdminEmail(lead), contactAckEmail(lead), sendNewLeadAlert(lead)]);
  }
  return lead;
};

const listLeads = async (query) => {
  const { page, limit, skip, sort, q } = parseListQuery(query);
  const filter = { isDeleted: false };
  if (query.stage) filter.stage = query.stage;
  if (query.source) filter.source = query.source;
  if (query.branchId) filter.branchId = query.branchId;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.model) filter.model = query.model;
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { leadCode: new RegExp(q, 'i') },
    ];
  }
  if (query.from || query.to) {
    filter.updatedAt = {};
    if (query.from) filter.updatedAt.$gte = new Date(query.from);
    if (query.to) filter.updatedAt.$lte = new Date(query.to);
  }
  const [data, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'name email').populate('branchId', 'name code'),
    Lead.countDocuments(filter),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
};

const getLead = async (id) => {
  const lead = await Lead.findOne({ _id: id, isDeleted: false })
    .populate('assignedTo', 'name email phone')
    .populate('branchId');
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const updateLead = async (id, payload, userId) => {
  const lead = await Lead.findOne({ _id: id, isDeleted: false });
  if (!lead) throw new AppError('Lead not found', 404);
  Object.assign(lead, payload);
  if (payload.phone) lead.phone = normalizePhone(payload.phone);
  if (payload.note) {
    lead.notes.push({ text: payload.note, by: userId });
  }
  lead.updatedBy = userId;
  await lead.save();
  return lead;
};

const assignLead = async (id, assignedTo, userId) => {
  const lead = await getLead(id);
  lead.assignedTo = assignedTo;
  if (lead.stage === 'New') lead.stage = 'Assigned';
  lead.updatedBy = userId;
  await lead.save();
  return lead;
};

const softDeleteLead = async (id) => {
  const lead = await getLead(id);
  lead.isDeleted = true;
  lead.deletedAt = new Date();
  await lead.save();
  return lead;
};

const leadStats = async (query = {}) => {
  const match = { isDeleted: false };
  if (query.branchId) match.branchId = query.branchId;
  if (query.from || query.to) {
    match.createdAt = {};
    if (query.from) match.createdAt.$gte = new Date(query.from);
    if (query.to) match.createdAt.$lte = new Date(query.to);
  }
  const byStage = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$stage', count: { $sum: 1 } } },
  ]);
  const bySource = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);
  return { byStage, bySource };
};

/**
 * Upload optional PDF and send quotation via WhatsApp (AiSensy) + email.
 * body: { model?, pdfUrl?, filename? }
 * file: multer file (optional if pdfUrl provided)
 */
const isPublicHttpsUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return false;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
};

const sendLeadQuotation = async (id, body = {}, file, userId) => {
  const lead = await getLead(id);
  const destination = lead.whatsapp || lead.phone;
  if (!destination) throw new AppError('Lead has no phone / WhatsApp number', 400);

  if (body.model && String(body.model).trim()) {
    lead.model = String(body.model).trim();
  }
  if (!lead.model) throw new AppError('Product / model is required for quotation', 400);

  let mediaDoc;
  let pdfUrl = body.pdfUrl ? String(body.pdfUrl).trim() : '';
  let filename = body.filename || 'HY-Bajaj-Quotation.pdf';
  let pdfBuffer = null;

  if (file) {
    try {
      const fs = require('fs');
      if (file.buffer) {
        pdfBuffer = file.buffer;
      } else if (file.path && fs.existsSync(file.path)) {
        pdfBuffer = fs.readFileSync(file.path);
      }
    } catch {
      /* continue without local buffer; email will fetch from URL */
    }
    mediaDoc = await uploadFile(file, {
      folder: 'quotations',
      entityType: 'lead',
      entityId: lead._id,
      userId,
    });
    pdfUrl = mediaDoc.url;
    filename = file.originalname || filename;
  }

  if (!pdfUrl) {
    throw new AppError('Quotation PDF is required (upload a file or provide pdfUrl)', 400);
  }

  if (!/\.pdf$/i.test(filename)) {
    filename = `${filename.replace(/\.[^.]+$/, '') || 'HY-Bajaj-Quotation'}.pdf`;
  }

  if (!isPublicHttpsUrl(pdfUrl)) {
    throw new AppError(
      'Quotation PDF must be a public HTTPS URL (Cloudinary). Localhost URLs cannot be delivered on WhatsApp.',
      400
    );
  }

  const media = { url: pdfUrl, filename };

  const [wa, mail] = await Promise.allSettled([
    sendQuotation(lead, media),
    quotationEmail(lead, { pdfUrl, filename, pdfBuffer }),
  ]);

  const waResult = wa.status === 'fulfilled' ? wa.value : { error: wa.reason?.message || String(wa.reason) };
  const mailResult = mail.status === 'fulfilled' ? mail.value : { error: mail.reason?.message || String(mail.reason) };

  const waOk = waResult && !waResult.error && !waResult.skipped && waResult.data;
  const waSkipped = Boolean(waResult?.skipped);
  const emailCustomerOk =
    mailResult?.customer && !mailResult.customer.error && !mailResult.customer.skipped;
  const emailFailed = Boolean(mailResult?.error || mailResult?.failed?.length);

  if (waSkipped) {
    throw new AppError('WhatsApp not configured (AISENSY_API_KEY missing)', 503);
  }
  if (!waOk) {
    throw new AppError(`WhatsApp quotation failed: ${waResult?.error || 'unknown error'}`, 502);
  }

  if (lead.stage === 'New' || lead.stage === 'Assigned') {
    lead.stage = 'Follow up';
  }
  lead.notes.push({
    text: `Quotation sent for ${lead.model} · WA ok · Email ${emailCustomerOk ? 'sent' : lead.email ? 'failed/skipped' : 'no customer email'} · PDF: ${pdfUrl}`,
    by: userId,
  });
  lead.updatedBy = userId;
  await lead.save();

  return {
    leadId: lead.leadCode,
    model: lead.model,
    pdfUrl,
    destinations: {
      whatsapp: destination,
      email: lead.email || null,
    },
    whatsapp: waResult,
    email: mailResult,
    warnings: [
      !lead.email ? 'Customer has no email — WhatsApp only' : null,
      emailFailed ? 'Email delivery reported errors (check SMTP credentials)' : null,
      mailResult?.customer?.skipped === true && mailResult.customer.reason === 'NO_CUSTOMER_EMAIL'
        ? null
        : mailResult?.customer?.skipped
          ? `Customer email skipped: ${mailResult.customer.reason}`
          : null,
    ].filter(Boolean),
  };
};

module.exports = {
  createLead,
  listLeads,
  getLead,
  updateLead,
  assignLead,
  softDeleteLead,
  leadStats,
  sendLeadQuotation,
};
