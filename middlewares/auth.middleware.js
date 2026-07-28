const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { ROLES } = require('../config/constants');

const auth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication required', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.accessSecret);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.sub).select('-passwordHash -refreshTokens');
    if (!user || user.isDeleted || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return next();
    const token = header.slice(7);
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    const user = await User.findById(decoded.sub).select('-passwordHash -refreshTokens');
    if (user && !user.isDeleted && user.isActive) req.user = user;
    next();
  } catch {
    next();
  }
};

const requireRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }
  return next();
};

const adminOnly = requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN);
const superAdminOnly = requireRoles(ROLES.SUPER_ADMIN);

module.exports = { auth, optionalAuth, requireRoles, adminOnly, superAdminOnly };
