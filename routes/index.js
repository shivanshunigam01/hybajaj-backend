const express = require('express');
const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const leadRoutes = require('./lead.routes');
const dseRoutes = require('./dse.routes');
const setupRoutes = require('./setup.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'HY Bajaj API healthy', data: { uptime: process.uptime() } });
});

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/leads', leadRoutes);
router.use('/dse', dseRoutes);
router.use('/setup', setupRoutes);
router.use('/', adminRoutes);

module.exports = router;
