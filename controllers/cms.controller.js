const cmsService = require('../services/cms.service');
const { success } = require('../utils/apiResponse');

const getPublicSite = async (_req, res, next) => {
  try {
    const data = await cmsService.getPublicSiteBundle();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const getAdminHomepage = async (_req, res, next) => {
  try {
    const data = await cmsService.getHomepageContent();
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};

const updateAdminHomepage = async (req, res, next) => {
  try {
    const data = await cmsService.updateHomepageContent(req.body);
    return success(res, { message: 'Website content updated', data });
  } catch (e) {
    next(e);
  }
};

const resetHomepage = async (_req, res, next) => {
  try {
    const SiteContent = require('../models/SiteContent');
    await SiteContent.deleteOne({ key: 'homepage' });
    const data = await cmsService.getHomepageContent();
    return success(res, { message: 'Reset to defaults', data });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getPublicSite,
  getAdminHomepage,
  updateAdminHomepage,
  resetHomepage,
};
