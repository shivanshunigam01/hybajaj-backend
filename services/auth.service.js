const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwtConfig = require('../config/jwt');
const { AppError } = require('../utils/AppError');
const { normalizePhone, isValidIndianMobile } = require('../utils/phone');
const { welcomeEmail, forgotPasswordEmail, otpEmail } = require('./email.service');
const { sendOtp } = require('./whatsapp.service');
const { ROLES } = require('../config/constants');

const signAccess = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, branchIds: user.branchIds },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn }
  );

const signRefresh = (user) =>
  jwt.sign({ sub: user._id.toString() }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
    '+passwordHash +refreshTokens'
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account is inactive', 403);

  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user: user.toSafeJSON(),
  };
};

const register = async (payload, actor) => {
  if (actor.role !== ROLES.SUPER_ADMIN) throw new AppError('Only super admin can register users', 403);
  if (!isValidIndianMobile(payload.phone)) throw new AppError('Invalid phone', 400);

  const exists = await User.findOne({
    $or: [{ email: payload.email.toLowerCase() }, { phone: normalizePhone(payload.phone) }],
  });
  if (exists) throw new AppError('Email or phone already registered', 409);

  const passwordHash = await User.hashPassword(payload.password);
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: normalizePhone(payload.phone),
    passwordHash,
    role: payload.role,
    branchIds: payload.branchIds || [],
    dseCode: payload.dseCode,
  });
  await welcomeEmail(user);
  return user.toSafeJSON();
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError('Invalid refresh token', 401);
  }
  const accessToken = signAccess(user);
  const newRefresh = signRefresh(user);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken).concat(newRefresh);
  await user.save();
  return { accessToken, refreshToken: newRefresh, expiresIn: 3600 };
};

const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  if (refreshToken) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  } else {
    user.refreshTokens = [];
  }
  await user.save();
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (!user) return { message: 'If the email exists, a reset link was sent' };
  const token = jwt.sign({ sub: user._id.toString(), purpose: 'reset' }, jwtConfig.accessSecret, {
    expiresIn: '1h',
  });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await forgotPasswordEmail(user, resetUrl);
  return { message: 'If the email exists, a reset link was sent' };
};

const resetPassword = async ({ token, password }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.accessSecret);
  } catch {
    throw new AppError('Invalid or expired reset token', 400);
  }
  if (decoded.purpose !== 'reset') throw new AppError('Invalid reset token', 400);
  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user) throw new AppError('User not found', 404);
  user.passwordHash = await User.hashPassword(password);
  user.refreshTokens = [];
  await user.save();
  return { message: 'Password reset successful' };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash +refreshTokens');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.passwordHash = await User.hashPassword(newPassword);
  user.refreshTokens = [];
  await user.save();
  return { message: 'Password changed' };
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (data.name) user.name = data.name;
  if (data.avatarUrl) user.avatarUrl = data.avatarUrl;
  if (data.phone) {
    if (!isValidIndianMobile(data.phone)) throw new AppError('Invalid phone', 400);
    user.phone = normalizePhone(data.phone);
  }
  await user.save();
  return user.toSafeJSON();
};

const sendOtpCode = async ({ phone, purpose }) => {
  if (!isValidIndianMobile(phone)) throw new AppError('Invalid phone', 400);
  const normalized = normalizePhone(phone);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Otp.deleteMany({ phone: normalized, purpose });
  await Otp.create({ phone: normalized, purpose, otpHash, expiresAt });
  await sendOtp(normalized, otp, 5);
  return { otpSent: true, expiresIn: 300 };
};

const verifyOtpCode = async ({ phone, otp, purpose }) => {
  const normalized = normalizePhone(phone);
  const record = await Otp.findOne({ phone: normalized, purpose, verified: false }).sort({
    createdAt: -1,
  });
  if (!record || record.expiresAt < new Date()) throw new AppError('OTP expired', 400);
  if (record.attempts >= 5) throw new AppError('Too many OTP attempts', 429);
  const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (hash !== record.otpHash) {
    record.attempts += 1;
    await record.save();
    throw new AppError('Invalid OTP', 401);
  }
  record.verified = true;
  await record.save();
  const verificationToken = jwt.sign(
    { phone: normalized, purpose, verified: true },
    jwtConfig.accessSecret,
    { expiresIn: '10m' }
  );
  return { verified: true, verificationToken };
};

module.exports = {
  login,
  register,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  sendOtpCode,
  verifyOtpCode,
  signAccess,
};
