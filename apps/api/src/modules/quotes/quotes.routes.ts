import { Router } from 'express';
import * as controller from './quotes.controller';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import {
  submitQuoteSchema,
  updateQuoteStatusSchema,
  updateQuoteNotesSchema,
  listQuotesQuerySchema,
} from './quotes.schema';
import { quoteRateLimit } from '../../middleware/rate-limit.middleware';

const router = Router();

router.post('/', quoteRateLimit, validateBody(submitQuoteSchema), controller.submitQuote);
router.get('/ref/:refId', controller.getQuoteByRef);
router.get('/:refId/pdf', controller.downloadQuotePdf);

router.get(
  '/',
  validateQuery(listQuotesQuerySchema),
  controller.listQuotes
);

router.get(
  '/:id',
  controller.getQuote
);

router.patch(
  '/:id/status',
  validateBody(updateQuoteStatusSchema),
  controller.updateQuoteStatus
);

router.patch(
  '/:id/notes',
  validateBody(updateQuoteNotesSchema),
  controller.updateQuoteNotes
);

export default router;
