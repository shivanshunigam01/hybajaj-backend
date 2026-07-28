const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedKey = '';

const createSmtpTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  // Gmail App Passwords are often pasted with spaces — strip them.
  const pass = String(process.env.SMTP_PASS).replace(/\s+/g, '');
  const key = `${process.env.SMTP_HOST}|${process.env.SMTP_PORT}|${process.env.SMTP_USER}|${pass}`;
  if (cachedTransporter && cachedKey === key) return cachedTransporter;

  cachedKey = key;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
  });
  return cachedTransporter;
};

module.exports = { createSmtpTransport };
