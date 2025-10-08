import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import knex from '../utils/knex.js';

/**
 * @desc    Get all admin logs with pagination and filters
 * @route   GET /api/admin-logs
 * @access  Private/Admin
 */
export const getAdminLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  const adminId = req.query.admin_id as string;
  const action = req.query.action as string;
  const resourceType = req.query.resource_type as string;
  const dateFrom = req.query.date_from as string;
  const dateTo = req.query.date_to as string;

  let query = knex('admin_logs')
    .leftJoin('users', 'admin_logs.admin_id', 'users.id')
    .select(
      'admin_logs.*',
      'users.name as admin_name',
      'users.email as admin_email'
    );

  // Filters
  if (adminId) query = query.where('admin_logs.admin_id', adminId);
  if (action) query = query.where('admin_logs.action', action);
  if (resourceType) query = query.where('admin_logs.resource_type', resourceType);
  if (dateFrom) query = query.where('admin_logs.created_at', '>=', dateFrom);
  if (dateTo) query = query.where('admin_logs.created_at', '<=', dateTo);

  const logs = await query
    .orderBy('admin_logs.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  let countQuery = knex('admin_logs').count('* as count');
  if (adminId) countQuery = countQuery.where('admin_id', parseInt(adminId));
  if (action) countQuery = countQuery.where('action', action);
  if (resourceType) countQuery = countQuery.where('resource_type', resourceType);
  if (dateFrom) countQuery = countQuery.where('created_at', '>=', dateFrom);
  if (dateTo) countQuery = countQuery.where('created_at', '<=', dateTo);
  
  const [{ count }] = await countQuery;

  res.json(ApiResponse.paginated(logs, page, limit, Number(count)));
});

/**
 * @desc    Get log by ID
 * @route   GET /api/admin-logs/:id
 * @access  Private/Admin
 */
export const getAdminLogById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const log = await knex('admin_logs')
    .leftJoin('users', 'admin_logs.admin_id', 'users.id')
    .select(
      'admin_logs.*',
      'users.name as admin_name',
      'users.email as admin_email'
    )
    .where('admin_logs.id', id)
    .first();

  if (!log) {
    return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Log non trouvé'));
  }

  res.json(ApiResponse.success(log));
});

/**
 * @desc    Get admin activity summary
 * @route   GET /api/admin-logs/stats
 * @access  Private/Admin
 */
export const getAdminLogStats = asyncHandler(async (req: Request, res: Response) => {
  const daysBack = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Total actions by admin
  const topAdmins = await knex('admin_logs')
    .join('users', 'admin_logs.admin_id', 'users.id')
    .select(
      'users.id',
      'users.name',
      knex.raw('COUNT(*) as action_count')
    )
    .where('admin_logs.created_at', '>=', startDate)
    .groupBy('users.id', 'users.name')
    .orderBy('action_count', 'desc')
    .limit(10);

  // Actions by type
  const actionsByType = await knex('admin_logs')
    .select(
      'action',
      knex.raw('COUNT(*) as count')
    )
    .where('created_at', '>=', startDate)
    .groupBy('action')
    .orderBy('count', 'desc');

  // Actions over time (daily)
  const actionsOverTime = await knex('admin_logs')
    .select(
      knex.raw('DATE(created_at) as date'),
      knex.raw('COUNT(*) as count')
    )
    .where('created_at', '>=', startDate)
    .groupBy('date')
    .orderBy('date', 'asc');

  res.json(
    ApiResponse.success({
      top_admins: topAdmins,
      actions_by_type: actionsByType,
      actions_over_time: actionsOverTime,
    })
  );
});
