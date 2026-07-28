const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

const loggerMiddleware = [
  morgan('dev'),
  morgan('combined', { stream: accessLogStream }),
];

module.exports = { loggerMiddleware };
