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

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);

// Allow every origin (reflect request Origin so credentials still work)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Disposition'],
    optionsSuccessStatus: 204,
  }),
);
app.options('*', cors({ origin: true, credentials: true }));
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

app.use(notFound);
app.use(errorHandler);

module.exports = app;
