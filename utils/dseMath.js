const dayjs = require('dayjs');

const calcProductivityScore = (entry) => {
  let score = 0;
  if (entry.freshContacts >= 15) score += 20;
  else if (entry.freshContacts >= 10) score += 12;
  if (entry.followUpCalls >= 20) score += 20;
  else if (entry.followUpCalls >= 12) score += 12;
  if (entry.qualifiedEnquiries >= 5) score += 15;
  if (entry.testRides >= 2) score += 15;
  else if (entry.testRides >= 1) score += 8;
  if (entry.bookings >= 1) score += 15;
  if (entry.retail >= 1) score += 10;
  if (entry.crmUpdated) score += 5;
  return Math.min(100, score);
};

const pct = (num, den) => (den ? num / den : 0);

const calcEmi = (price, down, months, rate) => {
  const P = Math.max(0, Number(price) - Number(down));
  const n = Number(months);
  const r = Number(rate) / 12 / 100;
  if (!n) return 0;
  if (!r) return Math.round(P / n);
  const emi = (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return Math.round(emi);
};

const agingDays = (loginDate) => {
  if (!loginDate) return 0;
  return Math.max(0, dayjs().diff(dayjs(loginDate), 'day'));
};

const healthForAchievement = (value, target = 0.85) =>
  value >= target ? 'On Track' : 'Gap';

module.exports = {
  calcProductivityScore,
  pct,
  calcEmi,
  agingDays,
  healthForAchievement,
};
