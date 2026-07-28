const SiteContent = require('../models/SiteContent');
const Settings = require('../models/Settings');

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
    {
      image: '/images/heroes/three-wheelers/brand-page.webp',
      alt: 'Bajaj Three Wheelers',
      title: '3 Wheelers & Qute',
      link: '/three-wheelers',
      cta: 'Explore Now',
      order: 4,
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
};

async function getHomepageContent() {
  let doc = await SiteContent.findOne({ key: 'homepage' }).lean();
  if (!doc) {
    const created = await SiteContent.create(DEFAULT_HOMEPAGE);
    doc = created.toObject();
  }
  return doc;
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

  const data = {
    content: {
      ...content,
      heroes: published(content.heroes),
      productCategories: published(content.productCategories),
      offers: published(content.offers),
      featured: published(content.featured),
      testimonials: published(content.testimonials),
      youtubeReviews: published(content.youtubeReviews),
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
