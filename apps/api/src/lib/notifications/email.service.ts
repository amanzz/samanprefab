import nodemailer from 'nodemailer';
import { config } from '../../config/index';
import type { Quote } from '@saman-prefab/db';

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getTransporter() {
  if (!config.email.host) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

interface QuoteItem {
  productName: string;
  variantLabel?: string | null;
  quantity: number;
  unit: string;
  estimatedPriceMin?: number | null;
  estimatedPriceMax?: number | null;
}

function buildQuoteItemsHtml(items: QuoteItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          ${item.productName}${item.variantLabel ? ` — ${item.variantLabel}` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
          ${item.quantity} ${item.unit}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">
          ${item.estimatedPriceMin && item.estimatedPriceMax
            ? `${formatINR(item.estimatedPriceMin)} – ${formatINR(item.estimatedPriceMax)}`
            : '—'}
        </td>
      </tr>`
    )
    .join('');
}

export async function sendQuoteConfirmation(
  quote: Quote,
  items: QuoteItem[]
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email Mock] Quote confirmation for ${quote.refId} → ${quote.contactEmail}`);
    return false;
  }

  if (!quote.contactEmail) return false;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <div style="background:#1e3a5f;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Saman Prefab</h1>
          <p style="color:#93c5fd;margin:4px 0 0;">Quote Confirmation</p>
        </div>
        <div style="padding:32px;">
          <p>Dear <strong>${quote.contactName}</strong>,</p>
          <p>Thank you for your enquiry! Your quote has been submitted successfully.</p>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-size:14px;color:#166534;">
              Quote Reference: <strong style="font-size:18px;">${quote.refId}</strong>
            </p>
          </div>

          <h3 style="color:#1e3a5f;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Quote Summary</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:8px 12px;text-align:left;font-weight:600;">Product</th>
                <th style="padding:8px 12px;text-align:center;font-weight:600;">Qty</th>
                <th style="padding:8px 12px;text-align:right;font-weight:600;">Est. Price</th>
              </tr>
            </thead>
            <tbody>${buildQuoteItemsHtml(items)}</tbody>
          </table>

          ${quote.estimatedTotalMin && quote.estimatedTotalMax ? `
          <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;margin:16px 0;text-align:right;">
            <span style="font-size:13px;color:#6b7280;">Estimated Total: </span>
            <strong style="font-size:16px;color:#1e3a5f;">
              ${formatINR(quote.estimatedTotalMin)} – ${formatINR(quote.estimatedTotalMax)}
            </strong>
          </div>` : ''}

          <p style="font-size:14px;color:#6b7280;">
            Delivery City: <strong>${quote.cityName}</strong><br>
            Timeline: <strong>${quote.timeline?.replace(/_/g, ' ')}</strong>
          </p>

          <p>Our sales team will contact you within <strong>24 hours</strong> on your registered mobile number.</p>

          <a href="https://wa.me/91${config.whatsapp.number}?text=Hi%2C+I+submitted+quote+${quote.refId}"
             style="display:inline-block;background:#25d366;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;">
            💬 Chat on WhatsApp
          </a>
        </div>
        <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
          Saman Prefab | Quality Prefabricated Structures Across India<br>
          This is an automated email. Please do not reply.
        </div>
      </div>
    </body>
    </html>`;

  await transporter.sendMail({
    from: `"Saman Prefab" <${config.email.from}>`,
    to: quote.contactEmail,
    subject: `Your Quote ${quote.refId} — Saman Prefab`,
    html,
  });

  return true;
}

export async function sendNewQuoteAlert(
  quote: Quote,
  items: QuoteItem[]
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email Mock] New quote alert for ${quote.refId} → admin`);
    return false;
  }

  const html = `
    <h2>New Quote Received — ${quote.refId}</h2>
    <p><strong>Contact:</strong> ${quote.contactName} | ${quote.contactPhone} | ${quote.contactEmail ?? 'no email'}</p>
    <p><strong>City:</strong> ${quote.cityName} | <strong>Timeline:</strong> ${quote.timeline}</p>
    <p><strong>Items:</strong></p>
    <ul>${items.map((i) => `<li>${i.productName} × ${i.quantity} ${i.unit}</li>`).join('')}</ul>
    ${quote.estimatedTotalMin ? `<p><strong>Est. Total:</strong> ${formatINR(quote.estimatedTotalMin)} – ${formatINR(quote.estimatedTotalMax ?? 0)}</p>` : ''}
    <p><strong>Source:</strong> ${quote.sourceUrl ?? 'direct'} | UTM: ${quote.utmSource ?? '—'}/${quote.utmMedium ?? '—'}</p>`;

  await transporter.sendMail({
    from: `"Saman Prefab System" <${config.email.from}>`,
    to: config.email.adminEmail,
    subject: `[New Lead] ${quote.refId} — ${quote.contactName} (${quote.cityName})`,
    html,
  });

  return true;
}
