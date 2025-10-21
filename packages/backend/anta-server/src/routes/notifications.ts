/**
 * Notifications Routes
 */

import { Router, Request, Response } from 'express';
import notificationsService from '../services/notifications.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationsService.getUserNotifications(
      userId,
      limit,
      offset
    );

    res.json({
      success: true,
      data: notifications,
      pagination: { limit, offset },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get notifications',
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notifications count
 */
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await notificationsService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get unread count',
    });
  }
});

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.patch('/:notificationId/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notificationId } = req.params;

    await notificationsService.markAsRead(parseInt(notificationId), userId);

    res.json({
      success: true,
      data: { message: 'Notification marked as read' },
    });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: error.message || 'Failed to mark notification as read',
    });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await notificationsService.markAllAsRead(userId);

    res.json({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: error.message || 'Failed to mark all notifications as read',
    });
  }
});

export default router;
