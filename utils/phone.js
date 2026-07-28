const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

const isValidIndianMobile = (phone) => {
  const n = normalizePhone(phone);
  return /^91[6-9]\d{9}$/.test(n);
};

module.exports = { normalizePhone, isValidIndianMobile };
