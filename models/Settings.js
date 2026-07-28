const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    website: {
      logoUrl: String,
      faviconUrl: String,
      siteName: { type: String, default: 'HY Bajaj Muzaffarpur' },
      tagline: String,
    },
    seo: {
      defaultTitle: String,
      defaultDescription: String,
      ogImage: String,
    },
    contact: {
      consumerPhone: { type: String, default: '9031082228' },
      consumerPhoneDisplay: { type: String, default: '+91 90310 82228' },
      commercialPhone: { type: String, default: '8340479554' },
      commercialPhoneDisplay: { type: String, default: '+91 83404 79554' },
      whatsappPrimary: { type: String, default: '919031082228' },
      adminEmail: { type: String, default: 'Bajajhy@gmail.com' },
      khabarLabel: { type: String, default: 'Khabar — Near Khabar Mandir' },
      saraiyaLabel: { type: String, default: 'Saraiya Manikpur' },
    },
    smtp: {
      host: String,
      port: Number,
      user: String,
      pass: String,
      from: String,
    },
    whatsapp: {
      provider: { type: String, default: 'aisensy' },
      apiKey: String,
      campaignIds: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    sms: { provider: String, apiKey: String },
    maps: { googleMapsApiKey: String },
    payments: { razorpayKeyId: String, razorpayKeySecret: String },
    cloudinary: { cloudName: String, apiKey: String, apiSecret: String, folder: String },
    social: { facebook: String, instagram: String, youtube: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
