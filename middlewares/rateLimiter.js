const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 500),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'OPTIONS' ||
    req.path === '/health' ||
    req.path === '/api/health' ||
    (req.method === 'GET' && (req.path.startsWith('/public') || req.originalUrl.includes('/api/public/'))),
  message: { success: false, message: 'Too many requests', errors: [] },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts', errors: [] },
});

const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many submissions', errors: [] },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'OTP rate limit exceeded', errors: [] },
});

module.exports = { globalLimiter, authLimiter, publicFormLimiter, otpLimiter };
