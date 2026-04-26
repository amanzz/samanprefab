import { Router } from 'express';
import * as controller from './settings.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { updateSettingSchema, bulkUpdateSettingsSchema } from './settings.schema';

const router = Router();

router.get('/public', controller.getPublicSettings);
router.get('/', authMiddleware, controller.getSettings);

router.put(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(updateSettingSchema),
  controller.updateSetting
);

router.patch(
  '/bulk',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(bulkUpdateSettingsSchema),
  controller.bulkUpdateSettings
);

export default router;
