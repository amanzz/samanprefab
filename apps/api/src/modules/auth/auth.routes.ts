import { Router } from 'express';
import * as controller from './auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireRole } from '../../middleware/auth.middleware';
import { authRateLimit } from '../../middleware/rate-limit.middleware';
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema';
import type { AuthenticatedRequest } from '../../types/index';

const router = Router();

router.post('/login', authRateLimit, validateBody(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, (req, res, next) =>
  controller.me(req as AuthenticatedRequest, res, next)
);

router.post(
  '/change-password',
  authMiddleware,
  validateBody(changePasswordSchema),
  (req, res, next) => controller.changePassword(req as AuthenticatedRequest, res, next)
);

router.patch(
  '/update-avatar',
  authMiddleware,
  (req, res, next) => controller.updateAvatar(req as AuthenticatedRequest, res, next)
);

router.post(
  '/register',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(registerSchema),
  controller.register
);

export default router;
