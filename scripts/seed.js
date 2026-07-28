require('dotenv').config();
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Branch = require('../models/Branch');
const SetupMasters = require('../models/SetupMasters');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const { AmcPlan } = require('../models/Amc');
const { ROLES } = require('../config/constants');
const dse = require('../services/dse.service');

const seed = async () => {
  await connectDB();

  await Settings.findOneAndUpdate({ key: 'default' }, { key: 'default' }, { upsert: true });
  await dse.getMasters();

  const branches = [
    {
      name: 'HY Bajaj — Two-Wheelers & Chetak EV',
      code: 'hy-consumer',
      type: 'consumer',
      address: 'Near Khabara Mandir Road, opp. Nexa, NH28, Muzaffarpur, Bihar 842002',
      phone: '9031038262',
      whatsapp: '919031038262',
      hours: 'Mon – Sun · 9:00 AM – 7:00 PM',
      monthlyRetailTarget: 60,
    },
    {
      name: 'H.Y. Motor — Commercial 3-Wheelers',
      code: 'hy-commercial',
      type: 'commercial',
      address: 'Near Bihar Hotel, near HDFC Bank, NH28, Bhagwanpur, Muzaffarpur, Bihar 842001',
      phone: '9570551166',
      whatsapp: '919570551166',
      hours: 'Mon – Sat · 9:30 AM – 7:00 PM',
    },
    {
      name: 'Muzaffarpur',
      code: 'dse-muzaffarpur',
      type: 'dse_outlet',
      address: 'Muzaffarpur',
      phone: '9031038262',
      hours: 'Mon – Sun · 9:00 AM – 7:00 PM',
      monthlyRetailTarget: 60,
    },
    {
      name: 'Sheohar',
      code: 'dse-sheohar',
      type: 'dse_outlet',
      address: 'Sheohar',
      phone: '9031038262',
      hours: 'Mon – Sat · 9:30 AM – 7:00 PM',
      monthlyRetailTarget: 22,
    },
    {
      name: 'Paroo',
      code: 'dse-paroo',
      type: 'dse_outlet',
      address: 'Paroo',
      phone: '9031038262',
      hours: 'Mon – Sat · 9:30 AM – 7:00 PM',
      monthlyRetailTarget: 18,
    },
    {
      name: 'Karza',
      code: 'dse-karza',
      type: 'dse_outlet',
      address: 'Karza',
      phone: '9031038262',
      hours: 'Mon – Sat · 9:30 AM – 7:00 PM',
      monthlyRetailTarget: 15,
    },
  ];

  for (const b of branches) {
    await Branch.findOneAndUpdate({ code: b.code }, b, { upsert: true, new: true });
  }

  const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@hybajaj.com';
  const phone = process.env.SEED_SUPER_ADMIN_PHONE || '9031038262';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'SecurePass1';
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'Super Admin',
      email,
      phone: `91${phone.slice(-10)}`,
      passwordHash: await User.hashPassword(password),
      role: ROLES.SUPER_ADMIN,
    });
    console.log('Super admin created:', email, password);
  } else {
    console.log('Super admin already exists:', email);
  }

  const cats = [
    { name: 'Motorcycles', slug: 'motorcycle', sortOrder: 1 },
    { name: 'Electric', slug: 'electric', sortOrder: 2 },
    { name: 'Three-Wheelers', slug: 'three_wheeler', sortOrder: 3 },
  ];
  for (const c of cats) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }

  await AmcPlan.findOneAndUpdate(
    { name: 'Silver Care' },
    {
      name: 'Silver Care',
      price: 2999,
      durationMonths: 12,
      benefits: ['2 free services', 'Priority booking'],
      isActive: true,
    },
    { upsert: true }
  );

  console.log('Seed complete');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
