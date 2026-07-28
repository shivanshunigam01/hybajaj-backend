const aisensy = require('../config/aisensy');
const { normalizePhone } = require('../utils/phone');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sendCampaign = async ({
  campaignName,
  destination,
  userName,
  templateParams = [],
  source = 'HY Bajaj CRM',
  paramsFallbackValue,
  media,
  retries = 3,
}) => {
  if (!aisensy.apiKey) {
    console.warn('[whatsapp] AiSensy not configured — skipping', campaignName);
    return { skipped: true, reason: 'AISENSY_NOT_CONFIGURED' };
  }

  const firstName = String(templateParams[0] || userName || 'user').split(/\s+/)[0];
  const payload = {
    apiKey: aisensy.apiKey,
    campaignName,
    destination: normalizePhone(destination),
    userName: userName || aisensy.userName || 'Customer',
    templateParams,
    source,
    media:
      media && media.url
        ? { url: media.url, filename: media.filename || 'quotation' }
        : {},
    buttons: [],
    carouselCards: [],
    location: {},
    attributes: {},
    paramsFallbackValue: paramsFallbackValue || { FirstName: firstName || 'user' },
  };

  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(aisensy.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `AiSensy HTTP ${res.status}`);
      return { skipped: false, data };
    } catch (err) {
      lastError = err;
      await sleep(500 * (i + 1));
    }
  }
  console.error('[whatsapp] failed', lastError?.message);
  return { skipped: false, error: lastError?.message };
};

const sendOtp = (phone, otp, minutes = 5) =>
  sendCampaign({
    campaignName: aisensy.campaigns.otp,
    destination: phone,
    templateParams: [String(otp), String(minutes)],
  });

const sendNewLeadAlert = (lead) =>
  sendCampaign({
    campaignName: aisensy.campaigns.lead,
    destination: process.env.WHATSAPP_ADMIN || '919031038262',
    userName: 'Admin',
    templateParams: [
      lead.leadCode,
      lead.name,
      lead.phone,
      lead.interest || lead.model || 'Enquiry',
      lead.source || 'Website',
    ],
  });

const sendTestRideConfirm = (booking) =>
  sendCampaign({
    campaignName: aisensy.campaigns.testRide,
    destination: booking.phone,
    userName: booking.fullName,
    templateParams: [
      booking.fullName,
      booking.model,
      String(booking.preferredDate).slice(0, 10),
      booking.timeSlot || '',
      booking.bookingCode,
    ],
  });

/** Customer welcome after product interest form (AiSensy campaign `bajajhy`). */
const sendProductInterestWelcome = (lead) => {
  const firstName = String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer';
  const productName = String(lead.model || lead.interest || 'Bajaj').trim() || 'Bajaj';
  const destination = lead.whatsapp || lead.phone;
  return sendCampaign({
    campaignName: aisensy.campaigns.productInterest,
    destination,
    userName: aisensy.userName || 'Zentroverse',
    templateParams: [firstName, productName],
    source: 'new-landing-page form',
    paramsFallbackValue: { FirstName: firstName },
  });
};

/**
 * Quotation with PDF attachment (AiSensy campaign `babajj qoute`).
 * Template: Dear {{1}} … quotation for the {{2}} … (PDF attached)
 */
const sendQuotation = (lead, media) => {
  const firstName = String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer';
  const productName = String(lead.model || lead.interest || 'Bajaj').trim() || 'Bajaj';
  const destination = lead.whatsapp || lead.phone;
  return sendCampaign({
    campaignName: aisensy.campaigns.quotation,
    destination,
    userName: aisensy.userName || 'Zentroverse',
    templateParams: [firstName, productName],
    source: 'new-landing-page form',
    media: {
      url: media.url,
      filename: media.filename || 'HY-Bajaj-Quotation.pdf',
    },
    paramsFallbackValue: { FirstName: firstName },
  });
};

module.exports = {
  sendCampaign,
  sendOtp,
  sendNewLeadAlert,
  sendTestRideConfirm,
  sendProductInterestWelcome,
  sendQuotation,
};
