const parseListQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const sortRaw = query.sort || '-createdAt';
  const sort = {};
  String(sortRaw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((field) => {
      if (field.startsWith('-')) sort[field.slice(1)] = -1;
      else sort[field] = 1;
    });
  const skip = (page - 1) * limit;
  return { page, limit, skip, sort, q: query.q ? String(query.q).trim() : '' };
};

const buildMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

module.exports = { parseListQuery, buildMeta };
