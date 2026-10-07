const express = require('express');
const { products, categories, testRides, users, settings, media, reports, financeApps, adminExtras } = require('../controllers/admin.controller');
const cmsCtrl = require('../controllers/cms.controller');
const { auth, requireRoles, adminOnly } = require('../middlewares/auth.middleware');
const { uploadSingle, uploadMultiple } = require('../middlewares/upload.middleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Website CMS (public homepage content)
router.get('/cms/homepage', auth, adminOnly, cmsCtrl.getAdminHomepage);
router.put('/cms/homepage', auth, adminOnly, cmsCtrl.updateAdminHomepage);
router.post('/cms/homepage/reset', auth, requireRoles(ROLES.SUPER_ADMIN), cmsCtrl.resetHomepage);

// Products
router.get('/products', auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES), products.list);
router.post('/products', auth, adminOnly, uploadMultiple('images', 10), products.create);
router.patch('/products/:id', auth, adminOnly, uploadMultiple('images', 10), products.update);
router.delete('/products/:id', auth, adminOnly, products.remove);

router.get('/categories', auth, categories.list);
router.post('/categories', auth, adminOnly, categories.create);
router.patch('/categories/:id', auth, adminOnly, categories.update);
router.delete('/categories/:id', auth, adminOnly, categories.remove);

// Test rides admin
router.get('/test-rides', auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.RECEPTION), testRides.list);
router.get('/test-rides/:id', auth, testRides.get);
router.patch('/test-rides/:id', auth, testRides.update);
router.post('/test-rides/:id/convert', auth, testRides.convert);
router.delete('/test-rides/:id', auth, adminOnly, testRides.remove);

// Finance applications
router.get('/finance-applications', auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE), financeApps.list);
router.get('/finance-applications/:id', auth, financeApps.get);
router.patch('/finance-applications/:id', auth, financeApps.update);

// Users
router.get('/users', auth, adminOnly, users.list);
router.post('/users', auth, adminOnly, users.create);
router.patch('/users/:id', auth, adminOnly, users.update);
router.delete('/users/:id', auth, requireRoles(ROLES.SUPER_ADMIN), users.remove);

// Settings
router.get('/settings', auth, adminOnly, settings.get);
router.patch('/settings', auth, requireRoles(ROLES.SUPER_ADMIN), settings.update);

// Media
router.post('/media/upload', auth, uploadSingle('file'), media.upload);
router.delete('/media/:id', auth, adminOnly, media.remove);

// Reports
router.get('/reports/leads', auth, adminOnly, reports.leads);
router.get('/reports/dse-productivity', auth, adminOnly, reports.dseProductivity);

// Service / exchange / licence / training
router.get('/service-bookings', auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SERVICE_MANAGER), adminExtras.listService);
router.patch('/service-bookings/:id', auth, adminExtras.updateService);
router.get('/exchange', auth, adminOnly, adminExtras.listExchange);
router.patch('/exchange/:id', auth, adminOnly, adminExtras.updateExchange);
router.get('/licence-requests', auth, adminOnly, adminExtras.listLicence);
router.patch('/licence-requests/:id', auth, adminOnly, adminExtras.updateLicence);
router.get('/training/courses', auth, requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TRAINER), adminExtras.listCourses);
router.post('/training/courses', auth, adminOnly, adminExtras.createCourse);
router.patch('/training/courses/:id', auth, adminOnly, adminExtras.updateCourse);
router.post('/training/batches', auth, adminOnly, adminExtras.createBatch);
router.get('/training/enrollments', auth, adminExtras.listEnrollments);
router.patch('/training/enrollments/:id', auth, adminOnly, adminExtras.updateEnrollment);
router.post('/training/certificates/issue', auth, adminOnly, adminExtras.issueCertificate);
router.get('/amc-plans', auth, adminExtras.listAmcPlans);
router.post('/amc-plans', auth, adminOnly, adminExtras.createAmcPlan);

module.exports = router;
