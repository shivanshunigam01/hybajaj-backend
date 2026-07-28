const { failure } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already exists`;
    errors = [{ field, message }];
  }

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path || 'id'}`;
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return failure(res, { status, message, errors });
};

module.exports = { errorHandler };
