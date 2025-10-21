/**
 * Notifications Service
 * Handles notification fetching and management
 */

import apiClient from './api.client';

export interface Notification {
  id: number;
  user_id: number;
  type: 'ride_accepted' | 'ride_started' | 'ride_completed' | 'ride_cancelled' | 'payment_confirmed' | 'driver_arrived' | 'promotion' | 'system';
  title: string;
  message: string;
  ride_id?: number;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

class NotificationsService {
  /**
   * Get user notifications
   */
  async getNotifications(limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const notifications = await apiClient.get<Notification[]>(
      `/notifications?limit=${limit}&offset=${offset}`
    );
    return notifications;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read', {});
  }
}

export default new NotificationsService();
