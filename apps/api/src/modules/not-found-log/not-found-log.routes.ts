import { Router } from 'express';
import * as controller from './not-found-log.controller';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  controller.listNotFoundLog
);

router.post('/', controller.logNotFoundExternal);

router.patch(
  '/:id/resolve',
  authMiddleware,
  requireRole('super_admin'),
  controller.markResolved
);

export default router;
