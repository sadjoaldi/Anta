import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import knex from '../utils/knex.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Get current date boundaries
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Users statistics
  const [userStats] = await knex('users')
    .select(
      knex.raw('COUNT(*) as total_users'),
      knex.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_today', [todayStart]),
      knex.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_week', [weekStart]),
      knex.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_month', [monthStart]),
      knex.raw('SUM(CASE WHEN last_login_at >= ? THEN 1 ELSE 0 END) as active_7days', [weekStart]),
      knex.raw('SUM(CASE WHEN role = "passenger" THEN 1 ELSE 0 END) as total_passengers'),
      knex.raw('SUM(CASE WHEN role = "driver" THEN 1 ELSE 0 END) as total_drivers'),
      knex.raw('SUM(CASE WHEN role = "admin" THEN 1 ELSE 0 END) as total_admins')
    );

  // Driver statistics
  const [driverStats] = await knex('drivers')
    .select(
      knex.raw('COUNT(*) as total_drivers'),
      knex.raw('SUM(CASE WHEN kyc_status = "approved" THEN 1 ELSE 0 END) as approved_drivers'),
      knex.raw('SUM(CASE WHEN kyc_status = "pending" THEN 1 ELSE 0 END) as pending_drivers'),
      knex.raw('SUM(CASE WHEN kyc_status = "rejected" THEN 1 ELSE 0 END) as rejected_drivers'),
      knex.raw('SUM(CASE WHEN status = "online" THEN 1 ELSE 0 END) as online_drivers'),
      knex.raw('AVG(rating_avg) as average_rating')
    );

  // Trips statistics (if trips table exists)
  let tripStats = {
    total_trips: 0,
    trips_today: 0,
    trips_week: 0,
    completed_trips: 0,
    cancelled_trips: 0,
    completion_rate: 0,
  };

  try {
    const [trips] = await knex('trips')
      .select(
        knex.raw('COUNT(*) as total_trips'),
        knex.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as trips_today', [todayStart]),
        knex.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as trips_week', [weekStart]),
        knex.raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_trips'),
        knex.raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_trips')
      );

    if (trips) {
      tripStats = {
        ...trips,
        completion_rate: trips.total_trips > 0 
          ? (trips.completed_trips / trips.total_trips) * 100 
          : 0,
      };
    }
  } catch (error) {
    // Trips table doesn't exist yet - that's okay
  }

  // Payments statistics (if payments table exists)
  let paymentStats = {
    total_revenue: 0,
    revenue_today: 0,
    revenue_week: 0,
    revenue_month: 0,
  };

  try {
    const [payments] = await knex('payments')
      .select(
        knex.raw('SUM(amount) as total_revenue'),
        knex.raw('SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END) as revenue_today', [todayStart]),
        knex.raw('SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END) as revenue_week', [weekStart]),
        knex.raw('SUM(CASE WHEN created_at >= ? THEN amount ELSE 0 END) as revenue_month', [monthStart])
      )
      .where('status', 'completed');

    if (payments) {
      paymentStats = payments;
    }
  } catch (error) {
    // Payments table doesn't exist yet - that's okay
  }

  // Calculate retention rate
  const retentionRate = userStats.total_users > 0
    ? (userStats.active_7days / userStats.total_users) * 100
    : 0;

  res.json(
    ApiResponse.success({
      users: {
        total: userStats.total_users || 0,
        new_today: userStats.new_today || 0,
        new_week: userStats.new_week || 0,
        new_month: userStats.new_month || 0,
        active_7days: userStats.active_7days || 0,
        retention_rate: retentionRate,
        by_role: {
          passengers: userStats.total_passengers || 0,
          drivers: userStats.total_drivers || 0,
          admins: userStats.total_admins || 0,
        },
      },
      drivers: {
        total: driverStats.total_drivers || 0,
        approved: driverStats.approved_drivers || 0,
        pending: driverStats.pending_drivers || 0,
        rejected: driverStats.rejected_drivers || 0,
        online: driverStats.online_drivers || 0,
        average_rating: Number(driverStats.average_rating || 0).toFixed(2),
      },
      trips: tripStats,
      revenue: paymentStats,
    })
  );
});
