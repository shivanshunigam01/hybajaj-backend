const nextCode = async (Model, { prefix, field = 'code', pad = 4 }) => {
  const latest = await Model.findOne({ [field]: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select(field)
    .lean();
  let n = 1;
  if (latest && latest[field]) {
    const m = String(latest[field]).match(/(\d+)$/);
    if (m) n = parseInt(m[1], 10) + 1;
  }
  return `${prefix}${String(n).padStart(pad, '0')}`;
};

module.exports = { nextCode };
