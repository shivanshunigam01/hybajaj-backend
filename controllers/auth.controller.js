const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return success(res, { message: 'Login successful', data });
  } catch (e) {
    next(e);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body, req.user);
    return success(res, { status: 201, message: 'User registered', data });
  } catch (e) {
    next(e);
  }
};

const refresh = async (req, res, next) => {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    return success(res, { message: 'Token refreshed', data });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id, req.body.refreshToken);
    return success(res, { message: 'Logged out', data: null });
  } catch (e) {
    next(e);
  }
};

const me = async (req, res) => success(res, { data: req.user.toSafeJSON() });

const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body.email);
    return success(res, { message: data.message, data: null });
  } catch (e) {
    next(e);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    return success(res, { message: data.message, data: null });
  } catch (e) {
    next(e);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const data = await authService.changePassword(req.user._id, req.body);
    return success(res, { message: data.message, data: null });
  } catch (e) {
    next(e);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await authService.updateProfile(req.user._id, req.body);
    return success(res, { message: 'Profile updated', data });
  } catch (e) {
    next(e);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const data = await authService.sendOtpCode(req.body);
    return success(res, { message: 'OTP sent', data });
  } catch (e) {
    next(e);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const data = await authService.verifyOtpCode(req.body);
    return success(res, { message: 'OTP verified', data });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  login,
  register,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  sendOtp,
  verifyOtp,
};
