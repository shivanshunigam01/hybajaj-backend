const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    image: String,
    alt: String,
    title: String,
    link: String,
    cta: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { _id: true }
);

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: String,
    cta: String,
    to: String,
    image: String,
    tone: { type: String, enum: ['brand', 'navy', 'surface', 'dark'], default: 'brand' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { _id: true }
);

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    place: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    text: String,
    vehicle: String,
    image: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { _id: true }
);

const youtubeReviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    youtubeId: { type: String, required: true },
    channel: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { _id: true }
);

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'homepage', unique: true },
    heroes: [heroSchema],
    trust: {
      countLabel: { type: String, default: '50,000+' },
      subtitle: String,
      stats: [{ value: String, label: String }],
    },
    productCategories: [
      {
        title: String,
        desc: String,
        to: String,
        image: String,
        order: { type: Number, default: 0 },
        published: { type: Boolean, default: true },
      },
    ],
    offers: [offerSchema],
    exchangeSteps: [{ n: String, t: String, d: String }],
    financeBullets: [String],
    featured: [
      {
        name: String,
        tag: String,
        tagline: String,
        price: String,
        emi: String,
        image: String,
        order: { type: Number, default: 0 },
        published: { type: Boolean, default: true },
      },
    ],
    testimonials: [testimonialSchema],
    youtubeReviews: [youtubeReviewSchema],
    whyUs: [{ title: String, desc: String }],
    discover: [{ title: String, desc: String, to: String, image: String }],
    dealerBlurb: String,
    dealerTagline: String,
    averageRating: { type: String, default: '4.8 / 5' },
    financePromo: {
      image: String,
      title: String,
      subtitle: String,
      ctaText: String,
      ctaTo: String,
    },
    dealerGallery: [
      {
        image: String,
        alt: String,
        order: { type: Number, default: 0 },
        published: { type: Boolean, default: true },
      },
    ],
    testimonialsPromo: {
      image: String,
      eyebrow: String,
      title: String,
      text: String,
      ctaText: String,
      ctaTo: String,
    },
    sections: {
      productsEyebrow: String,
      productsTitle: String,
      productsSubtitle: String,
      offersEyebrow: String,
      offersTitle: String,
      offersSubtitle: String,
      offersLinkText: String,
      offersLinkTo: String,
      exchangeEyebrow: String,
      exchangeTitle: String,
      exchangeSubtitle: String,
      exchangeCtaText: String,
      exchangeCtaTo: String,
      financeEyebrow: String,
      featuredEyebrow: String,
      featuredTitle: String,
      featuredLinkText: String,
      featuredLinkTo: String,
      whyEyebrow: String,
      whyTitle: String,
      reviewsEyebrow: String,
      reviewsTitle: String,
      reviewsSubtitle: String,
      youtubeEyebrow: String,
      youtubeTitle: String,
      youtubeSubtitle: String,
      discoverEyebrow: String,
      discoverTitle: String,
      visitTitle: String,
      visitSubtitle: String,
      visitEmail: String,
      visitCtaPrimaryText: String,
      visitCtaPrimaryTo: String,
      visitCtaSecondaryText: String,
      visitCtaSecondaryTo: String,
    },
    visitSection: {
      twoWheelerTitle: String,
      threeWheelerTitle: String,
      twoWheelerPoints: [{ name: String, area: String, phone: String, phoneDigits: String }],
      threeWheelerContacts: [
        { name: String, location: String, role: String, phone: String, phoneDigits: String },
      ],
    },
    homeFaqs: [{ q: String, a: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
