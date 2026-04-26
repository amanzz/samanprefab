import { Router } from 'express';
import {
  createNotificationHandler,
  listNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from './notifications.controller';

const router = Router();

router.post('/', createNotificationHandler);
router.get('/', listNotificationsHandler);
router.get('/unread-count', getUnreadCountHandler);
router.post('/mark-read', markAsReadHandler);
router.post('/mark-all-read', markAllAsReadHandler);

export default router;
