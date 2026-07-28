const success = (res, { status = 200, message = 'OK', data = null, meta = null, pagination = null } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  if (pagination) body.pagination = pagination;
  if (meta && !pagination) body.pagination = meta;
  return res.status(status).json(body);
};

const failure = (res, { status = 400, message = 'Request failed', errors = [] } = {}) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { success, failure };
