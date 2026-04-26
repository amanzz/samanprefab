import { Router } from 'express';
import * as controller from './ai-settings.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { upsertAISettingSchema, createLogSchema } from './ai-settings.schema';

const router = Router();

router.get('/',          authMiddleware, requireRole('super_admin', 'content_editor'), controller.getAllSettings);
router.get('/logs',      authMiddleware, requireRole('super_admin', 'content_editor'), controller.getLogs);
router.get('/stats',     authMiddleware, requireRole('super_admin', 'content_editor'), controller.getStats);
router.get('/:context',  controller.getSettingByContext);

router.put(
  '/:context',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(upsertAISettingSchema),
  controller.upsertSetting
);

router.post(
  '/log',
  validateBody(createLogSchema),
  controller.createLog
);

export default router;
