const { validationResult } = require('express-validator');
const { failure } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return failure(res, { status: 400, message: 'Validation failed', errors });
};

module.exports = { validate };
