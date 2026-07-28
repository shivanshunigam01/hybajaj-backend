module.exports = {
  baseUrl:
    process.env.AISENSY_BASE_URL ||
    'https://backend.api-wa.co/campaign/zentroverse-global/api/v2',
  apiKey: process.env.AISENSY_API_KEY || '',
  userName: process.env.AISENSY_USER_NAME || 'Zentroverse',
  campaigns: {
    otp: process.env.AISENSY_OTP_CAMPAIGN || process.env.AISENSY_CAMPAIGN_NAME || 'hybajaj_otp_verification',
    lead: process.env.AISENSY_LEAD_CAMPAIGN || 'hybajaj_admin_new_lead',
    testRide: process.env.AISENSY_TESTRIDE_CAMPAIGN || 'hybajaj_testride_confirm',
    finance: process.env.AISENSY_FINANCE_CAMPAIGN || 'hybajaj_finance_status',
    escalation: process.env.AISENSY_ESCALATION_CAMPAIGN || 'hybajaj_weekly_escalation',
    productInterest: process.env.AISENSY_PRODUCT_INTEREST_CAMPAIGN || 'bajajhy',
    quotation: process.env.AISENSY_QUOTATION_CAMPAIGN || 'babajj qoute',
  },
};
