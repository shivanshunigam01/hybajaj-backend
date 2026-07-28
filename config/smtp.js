const nodemailer = require('nodemailer');

const createSmtpTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  // Gmail App Passwords are often pasted with spaces — strip them.
  const pass = String(process.env.SMTP_PASS).replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
  });
};

module.exports = { createSmtpTransport };
