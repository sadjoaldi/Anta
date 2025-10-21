/**
 * Notifications Service
 * Handles notification creation and management
 */

import knex from '../utils/knex.js';

export enum NotificationType {
  RIDE_ACCEPTED = 'ride_accepted',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  DRIVER_ARRIVED = 'driver_arrived',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  ride_id?: number;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationParams {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  ride_id?: number;
}

class NotificationsService {
  /**
   * Create a notification
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const [id] = await knex('notifications').insert({
      user_id: params.user_id,
      type: params.type,
      title: params.title,
      message: params.message,
      ride_id: params.ride_id,
      is_read: false,
      created_at: knex.fn.now(),
    });

    const notification = await knex('notifications')
      .where({ id })
      .first();

    return notification;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    const notifications = await knex('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return notifications;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const result = await knex('notifications')
      .where({ user_id: userId, is_read: false })
      .count('id as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await knex('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({
        is_read: true,
        read_at: knex.fn.now(),
      });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number): Promise<void> {
    await knex('notifications')
      .where({ user_id: userId, is_read: false })
      .update({
        is_read: true,
        read_at: knex.fn.now(),
      });
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  async deleteOldNotifications(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await knex('notifications')
      .where('created_at', '<', thirtyDaysAgo)
      .del();

    return deleted;
  }

  /**
   * Create ride accepted notification
   */
  async notifyRideAccepted(passengerId: number, rideId: number, driverName: string): Promise<void> {
    await this.createNotification({
      user_id: passengerId,
      type: NotificationType.RIDE_ACCEPTED,
      title: 'Course acceptée',
      message: `${driverName} a accepté votre course. Il arrive bientôt.`,
      ride_id: rideId,
    });
  }

  /**
   * Create ride started notification
   */
  async notifyRideStarted(passengerId: number, rideId: number, driverName: string): Promise<void> {
    await this.createNotification({
      user_id: passengerId,
      type: NotificationType.RIDE_STARTED,
      title: 'Course démarrée',
      message: `${driverName} a démarré votre course.`,
      ride_id: rideId,
    });
  }

  /**
   * Create ride completed notification
   */
  async notifyRideCompleted(passengerId: number, rideId: number, finalPrice: number): Promise<void> {
    await this.createNotification({
      user_id: passengerId,
      type: NotificationType.RIDE_COMPLETED,
      title: 'Course terminée',
      message: `Votre course est terminée. Montant: ${finalPrice.toLocaleString()} GNF`,
      ride_id: rideId,
    });
  }

  /**
   * Create ride cancelled notification
   */
  async notifyRideCancelled(userId: number, rideId: number, cancelledBy: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: NotificationType.RIDE_CANCELLED,
      title: 'Course annulée',
      message: `La course a été annulée par ${cancelledBy}.`,
      ride_id: rideId,
    });
  }
}

export default new NotificationsService();
