import { Request } from 'express';
import knex from './knex.js';

interface LogOptions {
  adminId: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  details?: string | Record<string, unknown>;
  req?: Request;
}

/**
 * Log admin action to database
 */
export async function logAdminAction(options: LogOptions): Promise<void> {
  const { adminId, action, resourceType, resourceId, details, req } = options;

  const logData = {
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    details: typeof details === 'string' ? details : JSON.stringify(details),
    ip_address: req ? getClientIp(req) : null,
    user_agent: req?.get('user-agent') || null,
  };

  try {
    await knex('admin_logs').insert(logData);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failure shouldn't break the main action
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string | null {
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || null;
}
