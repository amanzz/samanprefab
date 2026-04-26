import { Request, Response } from 'express';
import {
  createNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './notifications.service';
import type {
  CreateNotificationInput,
  MarkAsReadInput,
  ListNotificationsQuery,
} from './notifications.schema';

export async function createNotificationHandler(
  req: Request,
  res: Response
) {
  try {
    const input: CreateNotificationInput = req.body;
    const notification = await createNotification(input);
    res.status(201).json({ data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
}

export async function listNotificationsHandler(
  req: Request,
  res: Response
) {
  try {
    const query: ListNotificationsQuery = {
      type: req.query.type as any,
      unreadOnly: req.query.unreadOnly === 'true',
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
    };
    const result = await listNotifications(query);
    res.json(result);
  } catch (error) {
    console.error('Error listing notifications:', error);
    res.status(500).json({ error: 'Failed to list notifications' });
  }
}

export async function getUnreadCountHandler(
  req: Request,
  res: Response
) {
  try {
    const count = await getUnreadCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
}

export async function markAsReadHandler(
  req: Request,
  res: Response
) {
  try {
    const input: MarkAsReadInput = req.body;
    const result = await markAsRead(input);
    res.json(result);
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
}

export async function markAllAsReadHandler(
  req: Request,
  res: Response
) {
  try {
    const result = await markAllAsRead();
    res.json(result);
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
}
