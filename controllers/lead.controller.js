const leadService = require('../services/lead.service');
const { success } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { data, meta } = await leadService.listLeads(req.query);
    return success(res, { data, meta, pagination: meta });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const data = await leadService.getLead(req.params.id);
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await leadService.createLead(req.body, { userId: req.user._id, notify: false });
    return success(res, { status: 201, message: 'Lead created', data });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await leadService.updateLead(req.params.id, req.body, req.user._id);
    return success(res, { message: 'Lead updated', data });
  } catch (e) {
    next(e);
  }
};

const assign = async (req, res, next) => {
  try {
    const data = await leadService.assignLead(req.params.id, req.body.assignedTo, req.user._id);
    return success(res, { message: 'Lead assigned', data });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await leadService.softDeleteLead(req.params.id);
    return success(res, { message: 'Lead deleted', data });
  } catch (e) {
    next(e);
  }
};

const sendQuotation = async (req, res, next) => {
  try {
    const data = await leadService.sendLeadQuotation(req.params.id, req.body, req.file, req.user._id);
    return success(res, {
      status: 200,
      message: 'Quotation sent on WhatsApp and email',
      data,
    });
  } catch (e) {
    next(e);
  }
};

const stats = async (req, res, next) => {
  try {
    const data = await leadService.leadStats(req.query);
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

module.exports = { list, get, create, update, assign, remove, sendQuotation, stats };
