import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { db, quotes, quoteItems } from '@saman-prefab/db';
import { eq } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/index';

function formatINR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

function getPdfPath(refId: string): string {
  return path.resolve(config.upload.dir, 'pdfs', `${refId}.pdf`);
}

export function getPdfUrl(refId: string): string {
  return `/uploads/pdfs/${refId}.pdf`;
}

export async function generateQuotePdf(refId: string): Promise<string> {
  const quote = await db.query.quotes.findFirst({ where: eq(quotes.refId, refId) });
  if (!quote) throw new AppError(404, 'Quote not found', 'NOT_FOUND');

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id));

  const pdfPath = getPdfPath(refId);
  const pdfDir = path.dirname(pdfPath);
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const PRIMARY = '#1e3a5f';
    const ACCENT = '#3b82f6';
    const GRAY = '#6b7280';
    const LIGHT_BG = '#f3f4f6';

    const pageWidth = doc.page.width - 100;

    doc
      .rect(0, 0, doc.page.width, 80)
      .fill(PRIMARY)
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SAMAN PREFAB', 50, 22)
      .fontSize(10)
      .font('Helvetica')
      .text('Quality Prefabricated Structures Across India', 50, 50)
      .fillColor('#93c5fd')
      .text('www.samanprefab.com', 50, 64);

    doc
      .fillColor(ACCENT)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('QUOTATION', 50, 100)
      .fillColor(GRAY)
      .fontSize(10)
      .font('Helvetica')
      .text(`Reference: ${quote.refId}`, 50, 125)
      .text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, 140);

    doc
      .rect(50, 165, pageWidth, 1)
      .fill('#e5e7eb');

    doc
      .fillColor(PRIMARY)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('CUSTOMER DETAILS', 50, 180)
      .font('Helvetica')
      .fillColor('#111827')
      .fontSize(10)
      .text(`Name:  ${quote.contactName}`, 50, 198)
      .text(`Phone: ${quote.contactPhone}`, 50, 213)
      .text(`Email: ${quote.contactEmail ?? '—'}`, 50, 228)
      .text(`City:  ${quote.cityName}${quote.pincode ? ` — ${quote.pincode}` : ''}`, 50, 243)
      .text(`Timeline: ${quote.timeline?.replace(/_/g, ' ') ?? '—'}`, 50, 258)
      .text(`Installation Required: ${quote.installationRequired ? 'Yes' : 'No'}`, 50, 273);

    doc
      .rect(50, 295, pageWidth, 1)
      .fill('#e5e7eb');

    doc
      .fillColor(PRIMARY)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('PRODUCT DETAILS', 50, 310);

    const colX = [50, 250, 330, 420, 520];
    const rowH = 22;
    let rowY = 330;

    doc
      .rect(50, rowY, pageWidth, rowH)
      .fill(LIGHT_BG);

    doc
      .fillColor('#374151')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Product', colX[0] + 4, rowY + 7)
      .text('Variant', colX[1] + 4, rowY + 7)
      .text('Qty', colX[2] + 4, rowY + 7)
      .text('Unit', colX[3] + 4, rowY + 7)
      .text('Est. Price', colX[4] + 4, rowY + 7);

    rowY += rowH;

    for (const item of items) {
      doc
        .fillColor('#111827')
        .font('Helvetica')
        .fontSize(9)
        .text(item.productName, colX[0] + 4, rowY + 6, { width: 195, ellipsis: true })
        .text(item.variantLabel ?? '—', colX[1] + 4, rowY + 6, { width: 75, ellipsis: true })
        .text(String(item.quantity), colX[2] + 4, rowY + 6)
        .text(item.unit, colX[3] + 4, rowY + 6)
        .text(
          item.estimatedPriceMin && item.estimatedPriceMax
            ? `${formatINR(item.estimatedPriceMin)} –\n${formatINR(item.estimatedPriceMax)}`
            : '—',
          colX[4] + 4,
          rowY + 6,
          { width: 90 }
        );

      rowY += rowH;
      doc.rect(50, rowY - 1, pageWidth, 0.5).fill('#e5e7eb');
    }

    rowY += 10;

    if (quote.estimatedTotalMin && quote.estimatedTotalMax) {
      doc
        .rect(350, rowY, pageWidth - 300, 28)
        .fill(PRIMARY);
      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('ESTIMATED TOTAL', 360, rowY + 8)
        .text(
          `${formatINR(quote.estimatedTotalMin)} – ${formatINR(quote.estimatedTotalMax)}`,
          430,
          rowY + 8
        );
      rowY += 45;
    }

    doc
      .rect(50, rowY + 10, pageWidth, 1)
      .fill('#e5e7eb');

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Note: Prices are indicative estimates. Final pricing subject to site survey, material selection, and logistics. GST applicable as per prevailing rates.',
        50,
        rowY + 20,
        { width: pageWidth, align: 'left' }
      );

    const footerY = doc.page.height - 60;
    doc
      .rect(0, footerY, doc.page.width, 60)
      .fill(LIGHT_BG)
      .fillColor(GRAY)
      .fontSize(8)
      .text(
        `This quotation is valid for 30 days from issue date. | ${config.site.name} | ${config.site.url}`,
        50,
        footerY + 20,
        { align: 'center', width: pageWidth }
      );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const pdfUrl = getPdfUrl(refId);
  await db.update(quotes).set({ pdfUrl }).where(eq(quotes.id, quote.id));

  return pdfPath;
}

export async function getOrGenerateQuotePdf(refId: string): Promise<string> {
  const pdfPath = getPdfPath(refId);
  if (fs.existsSync(pdfPath)) return pdfPath;
  return generateQuotePdf(refId);
}
