import type { Request, Response, NextFunction } from 'express';
import * as quotesService from './quotes.service';
import { getOrGenerateQuotePdf } from '../../lib/pdf/quote-pdf.service';
import type {
  SubmitQuoteInput,
  UpdateQuoteStatusInput,
  UpdateQuoteNotesInput,
  ListQuotesQuery,
} from './quotes.schema';

export async function submitQuote(req: Request, res: Response, next: NextFunction) {
  try {
    res.set('Cache-Control', 'no-store');
    const result = await quotesService.submitQuote(req.body as SubmitQuoteInput);
    res.status(201).json({
      success: true,
      data: {
        refId: result.quote.refId,
        id: result.quote.id,
        estimatedTotalMin: result.estimatedTotalMin,
        estimatedTotalMax: result.estimatedTotalMax,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await quotesService.listQuotes(req.query as unknown as ListQuotesQuery);
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.getQuoteById(req.params.id);
    res.json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
}

export async function getQuoteByRef(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.getQuoteByRefId(req.params.refId);
    res.json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
}

export async function updateQuoteStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.updateQuoteStatus(
      req.params.id,
      req.body as UpdateQuoteStatusInput
    );
    res.json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
}

export async function updateQuoteNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const quote = await quotesService.updateQuoteNotes(
      req.params.id,
      req.body as UpdateQuoteNotesInput
    );
    res.json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
}

export async function downloadQuotePdf(req: Request, res: Response, next: NextFunction) {
  try {
    const pdfPath = await getOrGenerateQuotePdf(req.params.refId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${req.params.refId}.pdf"`,
      'Cache-Control': 'public, max-age=86400',
    });
    res.sendFile(pdfPath);
  } catch (err) {
    next(err);
  }
}
