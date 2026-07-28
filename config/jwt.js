module.exports = {
  accessSecret: process.env.JWT_SECRET,
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
};
