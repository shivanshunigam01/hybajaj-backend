const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

const skipNoise = (req) =>
  req.method === 'OPTIONS' || req.url === '/api/health' || req.url === '/health';

const loggerMiddleware =
  process.env.NODE_ENV === 'production'
    ? [morgan('combined', { stream: accessLogStream, skip: skipNoise })]
    : [morgan('dev', { skip: skipNoise })];

module.exports = { loggerMiddleware };
