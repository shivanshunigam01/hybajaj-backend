const { createSmtpTransport } = require('../config/smtp');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const brandedEmailShell = ({ title, bodyHtml }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#0a1628;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d8e0ea;">
        <tr>
          <td style="background:#003d7a;padding:20px 24px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8ec5ff;font-weight:700;">HY Bajaj Motors</p>
            <p style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">${escapeHtml(title)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;font-size:15px;line-height:1.65;color:#0a1628;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 22px;background:#f7fafc;border-top:1px solid #e6edf5;font-size:12px;color:#5b6b7c;line-height:1.5;">
            HY Bajaj Muzaffarpur · Authorised Bajaj Dealer<br/>
            This is an automated message from HY Bajaj Motors.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  const transporter = createSmtpTransport();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping send:', subject);
    return { skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || subject,
      attachments,
    });
    console.log('[email] sent', { to, subject, messageId: info.messageId });
    return { skipped: false, messageId: info.messageId, to };
  } catch (err) {
    console.error('[email] send failed', {
      to,
      subject,
      code: err.code,
      responseCode: err.responseCode,
      message: err.message,
    });
    throw err;
  }
};

const welcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to HY Bajaj CRM — set up your access',
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your HY Bajaj CRM account (${escapeHtml(user.role)}) is ready.</p><p>Login: ${escapeHtml(process.env.FRONTEND_URL)}/admin</p>`,
  });

const forgotPasswordEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Reset your HY Bajaj CRM password',
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Reset your password: <a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p><p>Expires in 60 minutes.</p>`,
  });

const leadAdminEmail = (lead) =>
  sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `New lead ${lead.leadCode} — ${lead.interest || lead.model || 'Enquiry'}`,
    html: `<p>Lead <b>${escapeHtml(lead.leadCode)}</b></p><p>${escapeHtml(lead.name)} · ${escapeHtml(lead.phone)}</p><p>${escapeHtml(lead.message || '')}</p>`,
  });

const contactAckEmail = (lead) => {
  if (!lead.email) return Promise.resolve({ skipped: true, reason: 'NO_CUSTOMER_EMAIL' });
  return sendEmail({
    to: lead.email,
    subject: 'We received your message — HY Bajaj Muzaffarpur',
    html: `<p>Hi ${escapeHtml(lead.name)},</p><p>We received your enquiry (${escapeHtml(lead.leadCode)}). Our team will contact you within 2 business hours.</p>`,
  });
};

const productInterestWelcomeHtml = (lead) => {
  const firstName = escapeHtml(String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer');
  const model = escapeHtml(lead.model || lead.interest || 'Bajaj');
  return brandedEmailShell({
    title: 'Welcome to the HY Bajaj Family!',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${firstName},</p>
      <p style="margin:0 0 12px;">Thank you for your interest in the <strong>${model}</strong>.</p>
      <p style="margin:0 0 12px;">Your request has been successfully registered.</p>
      <p style="margin:0 0 8px;">One of our Bajaj Relationship Managers will contact you shortly to help you with:</p>
      <ul style="margin:0 0 16px;padding-left:18px;">
        <li>Best On-Road Price</li>
        <li>Finance &amp; EMI Plans</li>
        <li>Exchange Assistance</li>
        <li>Accessories</li>
        <li>Test Ride Booking</li>
      </ul>
      <p style="margin:0 0 12px;">At HY Bajaj Motors, we believe every ride begins with trust.</p>
      <p style="margin:0;">See you soon at HY Bajaj Motors.</p>
    `,
  });
};

const productInterestWelcomeEmail = (lead) => {
  const firstName = String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer';
  const model = lead.model || 'Bajaj';
  const adminTo = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const jobs = [];

  if (lead.email) {
    jobs.push(
      sendEmail({
        to: lead.email,
        subject: 'Welcome to the HY Bajaj Family! — HY Bajaj Motors',
        html: productInterestWelcomeHtml(lead),
        text: `Welcome to the HY Bajaj Family! Hi ${firstName}, thank you for your interest in the ${model}. Your request has been registered.`,
      })
    );
  }

  if (adminTo) {
    jobs.push(
      sendEmail({
        to: adminTo,
        subject: `Product interest — ${model} — ${lead.name}`,
        html: `${productInterestWelcomeHtml(lead)}
          <div style="max-width:560px;margin:16px auto;padding:0 12px;font-family:Arial,sans-serif;font-size:13px;">
            <p><b>Lead</b> ${escapeHtml(lead.leadCode || '')}</p>
            <p><b>Phone</b> ${escapeHtml(lead.phone || '')}</p>
            <p><b>WhatsApp</b> ${escapeHtml(lead.whatsapp || lead.phone || '')}</p>
            <p><b>Address</b> ${escapeHtml(lead.address || '—')}</p>
            <p><b>Email</b> ${escapeHtml(lead.email || '—')}</p>
          </div>`,
      })
    );
  }

  if (!jobs.length) return Promise.resolve({ skipped: true, reason: 'NO_EMAIL_RECIPIENT' });
  return Promise.allSettled(jobs);
};

const testRideConfirmEmail = (booking, branch) =>
  sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `Test ride ${booking.bookingCode} — ${booking.model}`,
    html: `<p>${escapeHtml(booking.fullName)} booked ${escapeHtml(booking.model)} on ${escapeHtml(booking.preferredDate)} ${escapeHtml(booking.timeSlot || '')} at ${escapeHtml(branch?.name || 'showroom')}.</p>`,
  });

const otpEmail = (to, otp) =>
  sendEmail({
    to,
    subject: 'Your HY Bajaj verification code',
    html: `<p>Your code is <b>${escapeHtml(otp)}</b>. Valid for 5 minutes.</p>`,
  });

const quotationEmailHtml = (lead) => {
  const firstName = escapeHtml(String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer');
  const model = escapeHtml(lead.model || 'Bajaj');
  return brandedEmailShell({
    title: 'Your Bajaj Quotation is Ready!',
    bodyHtml: `
      <p style="margin:0 0 12px;">Dear ${firstName},</p>
      <p style="margin:0 0 12px;">Thank you for choosing HY Bajaj Motors.</p>
      <p style="margin:0 0 12px;">Your personalized quotation for the <strong>${model}</strong> has been prepared and is attached with this message.</p>
      <p style="margin:0 0 8px;">The quotation includes:</p>
      <ul style="margin:0 0 16px;padding-left:18px;">
        <li>Ex-Showroom &amp; On-Road Price</li>
        <li>Finance &amp; EMI Options</li>
        <li>Exchange Benefits (if applicable)</li>
        <li>Current Offers &amp; Schemes</li>
        <li>Accessories (if selected)</li>
      </ul>
      <p style="margin:0 0 12px;">Our Relationship Manager will be happy to explain every detail and assist you with the next steps.</p>
      <p style="margin:0;">Thank you for giving us the opportunity to serve you.<br/><strong>Team HY Bajaj Motors</strong></p>
    `,
  });
};

const fetchPdfBuffer = async (pdfUrl) => {
  if (!pdfUrl) return null;
  try {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`PDF fetch HTTP ${res.status}`);
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch (err) {
    console.warn('[email] PDF buffer fetch failed:', err.message);
    return null;
  }
};

const summarizeSettled = (results) => {
  if (!Array.isArray(results)) return results;
  return results.map((r) => {
    if (r.status === 'fulfilled') return r.value;
    return { skipped: false, error: r.reason?.message || String(r.reason) };
  });
};

const quotationEmail = async (lead, { pdfUrl, filename, pdfBuffer } = {}) => {
  const firstName = String(lead.name || 'Customer').trim().split(/\s+/)[0] || 'Customer';
  const model = lead.model || 'Bajaj';
  const safeName = filename && /\.pdf$/i.test(filename) ? filename : `${(filename || 'HY-Bajaj-Quotation').replace(/\.pdf$/i, '')}.pdf`;

  let content = pdfBuffer || null;
  if (!content && pdfUrl) content = await fetchPdfBuffer(pdfUrl);

  const attachments = [];
  if (content) {
    attachments.push({
      filename: safeName,
      content,
      contentType: 'application/pdf',
    });
  }

  const jobs = [];
  const customerJob = lead.email
    ? sendEmail({
        to: lead.email,
        subject: 'Your Bajaj Quotation is Ready — HY Bajaj Motors',
        html: quotationEmailHtml(lead),
        text: `Dear ${firstName}, your quotation for the ${model} is ready. Please see the attached PDF.`,
        attachments,
      })
    : Promise.resolve({ skipped: true, reason: 'NO_CUSTOMER_EMAIL' });

  jobs.push(customerJob);

  const adminTo = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminTo) {
    jobs.push(
      sendEmail({
        to: adminTo,
        subject: `Quotation sent — ${model} — ${lead.name}`,
        html: `${quotationEmailHtml(lead)}
          <div style="max-width:560px;margin:16px auto;padding:0 12px;font-family:Arial,sans-serif;font-size:13px;">
            <p><b>Customer email:</b> ${escapeHtml(lead.email || '—')}</p>
            <p><b>WhatsApp:</b> ${escapeHtml(lead.whatsapp || lead.phone || '')}</p>
            <p><b>PDF:</b> ${escapeHtml(pdfUrl || 'attached')}</p>
          </div>`,
        attachments: attachments.length ? attachments : undefined,
      })
    );
  }

  const settled = await Promise.allSettled(jobs);
  const summarized = summarizeSettled(settled);
  const customer = summarized[0];
  const admin = summarized[1];
  const failed = summarized.filter((r) => r && r.error);
  return {
    customer,
    admin,
    skipped: Boolean(customer?.skipped && (!admin || admin.skipped)),
    failed: failed.length ? failed : undefined,
  };
};

module.exports = {
  sendEmail,
  welcomeEmail,
  forgotPasswordEmail,
  leadAdminEmail,
  contactAckEmail,
  productInterestWelcomeEmail,
  quotationEmail,
  testRideConfirmEmail,
  otpEmail,
  escapeHtml,
};
