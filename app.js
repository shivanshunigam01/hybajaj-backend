const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { loggerMiddleware } = require('./middlewares/logger.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { notFound } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const { setupSwagger } = require('./config/swagger');
const apiRoutes = require('./routes');

const app = express();

app.set('trust proxy', 1);

/**
 * CORS MUST be first.
 * If a reverse-proxy/gateway returns 502 without these headers, the browser
 * still reports a CORS error and the request never appears in Node logs.
 */
function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  // Reflect any Origin so credentialed + non-credentialed both work
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] ||
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Access-Control-Max-Age', '86400');
}

app.use((req, res, next) => {
  applyCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Keep cors package as a second layer for safety
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());
try {
  app.use(xss());
} catch {
  // xss-clean may fail on newer Express — sanitization still covered by validators/mongoSanitize
}
app.use(globalLimiter);
loggerMiddleware.forEach((mw) => app.use(mw));

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

setupSwagger(app);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'HY Bajaj Drive API',
    data: {
      docs: '/api/docs',
      health: '/api/health',
      version: '1.0.0',
    },
  });
});

app.use('/api', apiRoutes);

app.use((req, res, next) => {
  applyCorsHeaders(req, res);
  next();
});
app.use(notFound);
app.use((err, req, res, next) => {
  applyCorsHeaders(req, res);
  return errorHandler(err, req, res, next);
});

module.exports = app;
