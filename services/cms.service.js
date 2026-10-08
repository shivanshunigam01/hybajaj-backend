const SiteContent = require('../models/SiteContent');
const Settings = require('../models/Settings');
const Product = require('../models/Product');

const DEFAULT_HOMEPAGE = {
  key: 'homepage',
  heroes: [
    {
      image: '/images/heroes/motorcycles/ns400-homepage.webp',
      alt: 'Bajaj Pulsar NS400',
      title: 'Pulsar NS400',
      link: '/motorcycles',
      cta: 'Book Test Ride',
      order: 0,
      published: true,
    },
    {
      image: '/images/heroes/motorcycles/ns125-whatsnew-web.webp',
      alt: 'Bajaj Pulsar NS125',
      title: 'Pulsar NS125',
      link: '/motorcycles',
      cta: 'Explore Motorcycles',
      order: 1,
      published: true,
    },
    {
      image: '/images/heroes/motorcycles/d400-homepage.webp',
      alt: 'Bajaj Dominar 400',
      title: 'Dominar 400',
      link: '/motorcycles',
      cta: 'Explore Now',
      order: 2,
      published: true,
    },
    {
      image: '/images/heroes/electric/c25-web.webp',
      alt: 'Bajaj Chetak Electric',
      title: 'Chetak Electric',
      link: '/electric',
      cta: 'Explore EV',
      order: 3,
      published: true,
    },
  ],
  trust: {
    countLabel: '50,000+',
    subtitle:
      'Customers have placed their trust in HY Bajaj across Muzaffarpur & North Bihar — and we are still counting.',
    stats: [
      { value: '15+', label: 'Years dealing' },
      { value: '4.8★', label: 'Customer rating' },
      { value: '98%', label: 'Finance approval' },
      { value: '7+', label: 'Sales & service points' },
    ],
  },
  productCategories: [
    {
      title: 'Motorcycles',
      desc: 'The leading force in sports and style — Pulsar, Dominar, Avenger & more.',
      to: '/motorcycles',
      image: '/images/products/motorcycles/motorcycles-navigation.webp',
      order: 0,
      published: true,
    },
    {
      title: 'Chetak',
      desc: 'Be part of electric. Connected, silent and ready for city roads.',
      to: '/electric',
      image: '/images/products/electric/Header%20Model%20Image-webp.webp',
      order: 1,
      published: true,
    },
    {
      title: '3 Wheelers & Qute',
      desc: 'Reliable. Easy. Efficient. Passenger, cargo and EV commercial range.',
      to: '/three-wheelers',
      image: '/images/products/three-wheelers/category-image.webp',
      order: 2,
      published: true,
    },
  ],
  offers: [
    {
      title: 'Festival finance deals',
      desc: 'Low down payment & flexible EMI on Pulsar, Dominar and Chetak.',
      cta: 'Check finance',
      to: '/finance',
      image: '/images/heroes/motorcycles/ns400-homepage.webp',
      tone: 'brand',
      order: 0,
      published: true,
    },
    {
      title: 'Exchange bonus',
      desc: 'Get extra value when you exchange your old two-wheeler at HY Bajaj.',
      cta: 'Start exchange',
      to: '/exchange',
      image: '/images/products/motorcycles/N160.webp',
      tone: 'navy',
      order: 1,
      published: true,
    },
    {
      title: 'Chetak demo ride',
      desc: 'Book a free Chetak EV demo at Khabar Mandir or Saraiya Manikpur.',
      cta: 'Book demo',
      to: '/test-ride',
      image: '/images/heroes/electric/c25-web.webp',
      tone: 'surface',
      order: 2,
      published: true,
    },
    {
      title: '3W commercial offers',
      desc: 'Ex-showroom price list WEF 08-07-2026 — ask area executives for on-road.',
      cta: 'View 3 wheelers',
      to: '/three-wheelers',
      image: '/images/heroes/three-wheelers/brand-page.webp',
      tone: 'dark',
      order: 3,
      published: true,
    },
  ],
  exchangeSteps: [
    { n: '01', t: 'Enter Details', d: 'Share your current bike or three-wheeler details.' },
    { n: '02', t: 'Get Estimate Price', d: 'Fair exchange estimate from HY Bajaj team.' },
    { n: '03', t: 'Value Inspection', d: 'Physical inspection at our Muzaffarpur points.' },
    { n: '04', t: 'Exchange & Drive Away', d: 'Paperwork done — ride your new Bajaj home.' },
  ],
  financeBullets: [
    'Lowest down payment options',
    'Instant approval process',
    'Flexible tenure & EMI plans',
    'Minimal documentation',
  ],
  featured: [
    {
      name: 'Pulsar NS 200',
      tag: 'Top seller',
      tagline: 'Twin channel ABS · OBD2B',
      price: 'Ask showroom',
      emi: 'EMI available',
      image: '/images/products/motorcycles/NS200.webp',
      order: 0,
      published: true,
    },
    {
      name: 'Pulsar N 160',
      tag: 'Popular',
      tagline: 'USD fork · Ride Modes · TBT',
      price: 'Ask showroom',
      emi: 'EMI available',
      image: '/images/products/motorcycles/N160.webp',
      order: 1,
      published: true,
    },
    {
      name: 'Dominar D 400',
      tag: 'Tourer',
      tagline: '350cc Dominar sport tourer',
      price: 'Ask showroom',
      emi: 'EMI available',
      image: '/images/products/motorcycles/Dominar%20400.webp',
      order: 2,
      published: true,
    },
    {
      name: 'Chetak 3502',
      tag: 'Electric',
      tagline: 'Sports & Eco modes',
      price: 'Ask showroom',
      emi: 'EMI available',
      image: '/images/products/electric/3502.webp',
      order: 3,
      published: true,
    },
  ],
  testimonials: [
    {
      name: 'Rahul Kumar',
      place: 'Muzaffarpur',
      rating: 5,
      text: 'Bought Pulsar NS200 from HY Bajaj. Smooth delivery, clear on-road quote and helpful finance desk.',
      vehicle: 'Pulsar NS200',
      image: '/images/products/motorcycles/NS200.webp',
      order: 0,
      published: true,
    },
    {
      name: 'Priya Sinha',
      place: 'Kanti',
      rating: 5,
      text: 'Chetak demo was excellent. Staff explained charging and EMI clearly. Happy with the purchase.',
      vehicle: 'Chetak',
      image: '/images/products/electric/3502.webp',
      order: 1,
      published: true,
    },
    {
      name: 'Imran Ansari',
      place: 'Bhagwanpur',
      rating: 5,
      text: 'Took RE Compact for commercial use. Sales executive guided paperwork end to end.',
      vehicle: 'RE Compact',
      image: '/images/products/three-wheelers/category-image.webp',
      order: 2,
      published: true,
    },
    {
      name: 'Suman Devi',
      place: 'Saraiya',
      rating: 5,
      text: 'Service at Saraiya Manikpur is prompt. Genuine parts and honest billing every time.',
      vehicle: 'Service',
      image: '/images/products/motorcycles/Platina-White-Bars-Background-P110.webp',
      order: 3,
      published: true,
    },
  ],
  youtubeReviews: [
    {
      title: 'Pulsar NS200 Review',
      youtubeId: '0zztWWCw16k',
      channel: 'YouTube',
      order: 0,
      published: true,
    },
    {
      title: 'Chetak Electric Review',
      youtubeId: 'JeNROKLK5u0',
      channel: 'YouTube',
      order: 1,
      published: true,
    },
    {
      title: 'Dominar 400 Review',
      youtubeId: 'lM4NZZtsiDs',
      channel: 'YouTube',
      order: 2,
      published: true,
    },
    {
      title: 'Bajaj 3 Wheeler Review',
      youtubeId: 'unlreWzI8zc',
      channel: 'YouTube',
      order: 3,
      published: true,
    },
  ],
  whyUs: [
    {
      title: 'Authorised Bajaj dealer',
      desc: 'Genuine vehicles, warranty support and company-backed service network in Muzaffarpur.',
    },
    {
      title: '2W + EV + 3W under one roof',
      desc: 'From Pulsar & Dominar to Chetak electric and commercial three-wheelers.',
    },
    {
      title: 'Finance & exchange desk',
      desc: 'Quick loan processing, exchange valuation and transparent on-road pricing.',
    },
    {
      title: 'Local sales executives',
      desc: 'Territory contacts across Bhagwanpur, Bakhari, Kanti, Khabra and Saraiya.',
    },
  ],
  discover: [
    {
      title: 'About HY Bajaj',
      desc: "Our story as Muzaffarpur's trusted Bajaj destination for sales and service.",
      to: '/about',
      image: '/images/heroes/motorcycles/ns400-homepage.webp',
    },
    {
      title: 'Service & workshop',
      desc: 'Periodic service, genuine spares and trained technicians at our points.',
      to: '/service',
      image: '/images/products/motorcycles/Dominar%20400.webp',
    },
    {
      title: 'Contact & directions',
      desc: 'Call, WhatsApp or visit Khabar Mandir and Saraiya Manikpur showrooms.',
      to: '/contact',
      image: '/images/heroes/electric/c25-web.webp',
    },
  ],
  dealerBlurb:
    'HY Bajaj is an authorised Bajaj dealer serving Muzaffarpur and nearby towns. Whether you want a Pulsar for daily commute, a Chetak for silent city rides, or a commercial three-wheeler for business — our team helps with on-road price, finance, exchange and after-sales service.',
  dealerTagline: 'Driving Dreams, Delivering Excellence',
  averageRating: '4.8 / 5',
  financePromo: {
    image: '/images/heroes/motorcycles/ns400-homepage.webp',
    title: 'Check Finance Offers',
    subtitle:
      'Drive home your Bajaj with easy EMI. Our finance desk helps you compare plans from leading partners.',
    ctaText: 'Check Finance Offers',
    ctaTo: '/finance',
  },
  dealerGallery: [
    {
      image: '/images/products/motorcycles/NS200.webp',
      alt: 'Pulsar at HY Bajaj',
      order: 0,
      published: true,
    },
    {
      image: '/images/products/electric/3501.webp',
      alt: 'Chetak',
      order: 1,
      published: true,
    },
    {
      image: '/images/products/three-wheelers/category-image.webp',
      alt: 'Three wheelers',
      order: 2,
      published: true,
    },
  ],
  testimonialsPromo: {
    image: '/images/products/electric/Testimonial%201.webp',
    eyebrow: 'Happy riders',
    title: 'From first enquiry to delivery — we stay with you.',
    text: 'Book a test ride, get an on-road quote, or speak to a three-wheeler sales executive for your area.',
    ctaText: 'Book Test Ride',
    ctaTo: '/test-ride',
  },
  sections: {
    productsEyebrow: 'Range',
    productsTitle: 'Our Products',
    productsSubtitle:
      'Explore Bajaj motorcycles, Chetak electric and commercial three-wheelers at HY Bajaj Muzaffarpur.',
    offersEyebrow: 'Offers',
    offersTitle: 'Current offers',
    offersSubtitle:
      "Finance, exchange, demo rides and commercial deals — ask the showroom for today's best quote.",
    offersLinkText: 'All finance offers →',
    offersLinkTo: '/finance',
    exchangeEyebrow: 'Exchange',
    exchangeTitle: 'Start Your Exchange',
    exchangeSubtitle: 'Upgrade to a new Bajaj in four simple steps at HY Muzaffarpur.',
    exchangeCtaText: 'Book A Valuation Now',
    exchangeCtaTo: '/exchange',
    financeEyebrow: 'Finance',
    featuredEyebrow: 'Fleet',
    featuredTitle: 'Featured Products',
    featuredLinkText: 'Explore all →',
    featuredLinkTo: '/motorcycles',
    whyEyebrow: 'Your dealer',
    whyTitle: 'Why choose HY Bajaj Muzaffarpur?',
    reviewsEyebrow: 'Reviews',
    reviewsTitle: 'What customers say',
    reviewsSubtitle: 'Real feedback from riders and commercial buyers across Muzaffarpur.',
    youtubeEyebrow: 'Video reviews',
    youtubeTitle: 'Watch on YouTube',
    youtubeSubtitle: 'Popular Bajaj model reviews — managed from the admin Website CMS.',
    discoverEyebrow: 'Discover',
    discoverTitle: 'Discover more about HY Bajaj',
    visitTitle: 'Visit & service locations',
    visitSubtitle:
      'Authorised Bajaj sales and service across Muzaffarpur. Call for on-road price, test rides and workshop support.',
    visitEmail: 'Bajajhy@gmail.com',
    visitCtaPrimaryText: 'Book Test Ride',
    visitCtaPrimaryTo: '/test-ride',
    visitCtaSecondaryText: 'Full contact details',
    visitCtaSecondaryTo: '/contact',
  },
  visitSection: {
    twoWheelerTitle: 'Two-wheeler service',
    threeWheelerTitle: 'Three-wheeler sales & service',
    twoWheelerPoints: [
      {
        name: 'Khabar — Near Khabar Mandir',
        area: 'Khabar, Muzaffarpur',
        phone: '+91 90310 82228',
        phoneDigits: '919031082228',
      },
      {
        name: 'Saraiya Manikpur',
        area: 'Saraiya Manikpur, Muzaffarpur',
        phone: '+91 83404 79554',
        phoneDigits: '918340479554',
      },
    ],
    threeWheelerContacts: [
      {
        name: 'Pooja',
        role: 'Sales',
        location: 'Bhagwanpur',
        phone: '+91 62877 96721',
        phoneDigits: '916287796721',
      },
      {
        name: 'Nilam',
        role: 'Sales',
        location: 'Bakhari',
        phone: '+91 72800 50754',
        phoneDigits: '917280050754',
      },
      {
        name: 'Ankit',
        role: 'Sales',
        location: 'Kanti',
        phone: '+91 96082 04062',
        phoneDigits: '919608204062',
      },
      {
        name: 'Ved Parkash',
        role: 'Sales',
        location: 'Khabra',
        phone: '+91 88739 78839',
        phoneDigits: '918873978839',
      },
      {
        name: 'Saraiya Service',
        role: 'Three-wheeler service',
        location: 'Saraiya',
        phone: '+91 84099 95078',
        phoneDigits: '918409995078',
      },
    ],
  },
  homeFaqs: [
    {
      q: 'Where is HY Bajaj showroom in Muzaffarpur?',
      a: 'HY Bajaj serves Muzaffarpur from Khabar (Near Khabar Mandir) and Saraiya Manikpur, plus three-wheeler sales points in Bhagwanpur, Bakhari, Kanti, Khabra and Saraiya.',
    },
    {
      q: 'Which Bajaj bikes are available at HY Bajaj Muzaffarpur?',
      a: 'We offer Pulsar, Dominar, Avenger, Platina, Chetak and commercial three-wheeler models — see our motorcycles, electric and three-wheeler pages for the full range.',
    },
    {
      q: 'Does HY Bajaj offer finance and exchange?',
      a: 'Yes. Finance EMI, exchange valuation, test rides and service are available at our Muzaffarpur branches.',
    },
  ],
};

const REMOVED_HERO_IMAGE = '/images/heroes/three-wheelers/brand-page.webp';

function applyContentDefaults(content) {
  const out = { ...content };
  out.sections = { ...DEFAULT_HOMEPAGE.sections, ...(content.sections || {}) };
  out.financePromo = { ...DEFAULT_HOMEPAGE.financePromo, ...(content.financePromo || {}) };
  out.testimonialsPromo = {
    ...DEFAULT_HOMEPAGE.testimonialsPromo,
    ...(content.testimonialsPromo || {}),
  };
  out.trust = {
    ...DEFAULT_HOMEPAGE.trust,
    ...(content.trust || {}),
    stats:
      content.trust?.stats?.length > 0 ? content.trust.stats : DEFAULT_HOMEPAGE.trust.stats,
  };
  if (!content.visitSection?.twoWheelerPoints?.length) {
    out.visitSection = { ...DEFAULT_HOMEPAGE.visitSection, ...(content.visitSection || {}) };
  } else {
    out.visitSection = {
      ...DEFAULT_HOMEPAGE.visitSection,
      ...content.visitSection,
    };
  }
  if (!content.homeFaqs?.length) {
    out.homeFaqs = DEFAULT_HOMEPAGE.homeFaqs;
  }
  return out;
}

async function getHomepageContent() {
  let doc = await SiteContent.findOne({ key: 'homepage' });
  if (!doc) {
    const created = await SiteContent.create(DEFAULT_HOMEPAGE);
    return applyContentDefaults(created.toObject());
  }

  const before = doc.heroes?.length || 0;
  doc.heroes = (doc.heroes || []).filter((h) => h.image !== REMOVED_HERO_IMAGE);
  if (doc.heroes.length !== before) {
    await doc.save();
    invalidatePublicSiteCache();
  }
  return applyContentDefaults(doc.toObject());
}

let siteCache = { at: 0, data: null };
const SITE_CACHE_TTL_MS = 30_000;

function invalidatePublicSiteCache() {
  siteCache = { at: 0, data: null };
}

async function updateHomepageContent(payload) {
  const allowed = { ...payload };
  delete allowed._id;
  delete allowed.__v;
  delete allowed.createdAt;
  delete allowed.updatedAt;
  allowed.key = 'homepage';
  const doc = await SiteContent.findOneAndUpdate({ key: 'homepage' }, allowed, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).lean();
  invalidatePublicSiteCache();
  return doc;
}

async function getPublicSiteBundle() {
  const now = Date.now();
  if (siteCache.data && now - siteCache.at < SITE_CACHE_TTL_MS) {
    return siteCache.data;
  }

  const [content, settings] = await Promise.all([
    getHomepageContent(),
    Settings.findOne({ key: 'default' }).select('website contact social seo').lean(),
  ]);

  const published = (arr) =>
    (arr || []).filter((x) => x.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0));

  const cmsFeatured = published(content.featured);
  const dbFeatured = await Product.find({
    isDeleted: false,
    status: 'published',
    isFeatured: true,
  })
    .select('name tag tagline exShowroomPrice emiFrom imageUrls')
    .sort({ name: 1 })
    .lean();
  const seenFeatured = new Set(cmsFeatured.map((f) => String(f.name || '').toLowerCase()));
  const fromProducts = dbFeatured
    .filter((p) => !seenFeatured.has(String(p.name || '').toLowerCase()))
    .map((p, order) => ({
      name: p.name,
      tag: p.tag || 'Featured',
      tagline: p.tagline || '',
      price:
        p.exShowroomPrice != null
          ? `₹${Number(p.exShowroomPrice).toLocaleString('en-IN')}`
          : 'Ask showroom',
      emi:
        p.emiFrom != null
          ? `EMI from ₹${Number(p.emiFrom).toLocaleString('en-IN')}/mo`
          : 'EMI available',
      image: p.imageUrls?.[0] || '',
      order: cmsFeatured.length + order,
      published: true,
    }));
  const featured = [...cmsFeatured, ...fromProducts];

  const data = {
    content: {
      ...content,
      heroes: published(content.heroes),
      productCategories: published(content.productCategories),
      offers: published(content.offers),
      featured,
      testimonials: published(content.testimonials),
      youtubeReviews: published(content.youtubeReviews),
      dealerGallery: published(content.dealerGallery),
    },
    settings: settings
      ? {
          website: settings.website,
          contact: settings.contact,
          social: settings.social,
          seo: settings.seo,
        }
      : null,
  };

  siteCache = { at: now, data };
  return data;
}

module.exports = {
  DEFAULT_HOMEPAGE,
  getHomepageContent,
  updateHomepageContent,
  getPublicSiteBundle,
  invalidatePublicSiteCache,
};
