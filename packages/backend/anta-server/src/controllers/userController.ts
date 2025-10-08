import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { logAdminAction } from '../utils/adminLogger.js';
import knex from '../utils/knex.js';
import User from '../models/User.js';

/**
 * @desc    Get all users with filters
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  // Filters
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;
  const filter = req.query.filter as string | undefined;

  // Build where clause
  const where: any = {};
  
  if (role) {
    where.role = role;
  }

  // Get users with filters
  let query = User.findAll(where, limit, offset);
  
  // Apply time-based filters
  if (filter === 'new_today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = knex('users')
      .where('created_at', '>=', today)
      .limit(limit)
      .offset(offset);
  } else if (filter === 'active') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query = knex('users')
      .where('last_login_at', '>=', weekAgo)
      .limit(limit)
      .offset(offset);
  }
  
  const users = await query;

  // Apply search filter after query (on name or phone)
  let filteredUsers = users;
  if (search) {
    filteredUsers = users.filter((user: any) => 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
    );
  }

  // Get total count with same filters
  let total = await User.count(where);
  if (filter === 'new_today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    total = await knex('users').where('created_at', '>=', today).count('* as count').first().then((r: any) => r?.count || 0);
  } else if (filter === 'active') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    total = await knex('users').where('last_login_at', '>=', weekAgo).count('* as count').first().then((r: any) => r?.count || 0);
  }

  res.json(ApiResponse.paginated(filteredUsers, page, limit, total));
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User');
  }

  res.json(ApiResponse.success(user));
});

/**
 * @desc    Get user by phone
 * @route   GET /api/users/phone/:phone
 * @access  Private
 */
export const getUserByPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;
  
  const user = await User.findByPhone(phone);
  if (!user) {
    throw ApiError.notFound('User');
  }

  res.json(ApiResponse.success(user));
});

/**
 * @desc    Get user by email
 * @route   GET /api/users/email/:email
 * @access  Private
 */
export const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params;
  
  const user = await User.findByEmail(email);
  if (!user) {
    throw ApiError.notFound('User');
  }

  res.json(ApiResponse.success(user));
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Public
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { phone, email, name, password_hash, default_payment_method_id } = req.body;

  // Check if phone already exists
  if (await User.phoneExists(phone)) {
    throw ApiError.conflict('Phone number already registered');
  }

  // Check if email already exists (if provided)
  if (email && await User.emailExists(email)) {
    throw ApiError.conflict('Email already registered');
  }

  const userId = await User.create({
    phone,
    email,
    name,
    password_hash,
    default_payment_method_id,
    role: 'passenger',
    is_active: true
  });

  const user = await User.findById(userId);
  res.status(201).json(ApiResponse.success(user));
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { phone, email, name, default_payment_method_id, is_active } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User');
  }

  // Check if new phone is already taken by another user
  if (phone && phone !== user.phone && await User.phoneExists(phone)) {
    throw ApiError.conflict('Phone number already in use');
  }

  // Check if new email is already taken by another user
  if (email && email !== user.email && await User.emailExists(email)) {
    throw ApiError.conflict('Email already in use');
  }

  await User.updateById(userId, {
    phone,
    email,
    name,
    default_payment_method_id,
    is_active,
    updated_at: new Date()
  });

  const updatedUser = await User.findById(userId);
  res.json(ApiResponse.success(updatedUser));
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User');
  }

  await User.deleteById(userId);
  res.json(ApiResponse.success({ message: 'User deleted successfully' }));
});

/**
 * @desc    Get active users
 * @route   GET /api/users/active
 * @access  Private/Admin
 */
export const getActiveUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const users = await User.getActiveUsers(limit, offset);
  const total = await User.count({ is_active: true });

  res.json(ApiResponse.paginated(users, page, limit, total));
});

/**
 * @desc    Suspend user (set is_active = false)
 * @route   PATCH /api/users/:id/suspend
 * @access  Private/Admin
 */
export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User');
  }

  if (!user.is_active) {
    throw ApiError.badRequest('User is already suspended');
  }

  await User.updateById(userId, {
    is_active: false,
    updated_at: new Date(),
  });

  const updatedUser = await User.findById(userId);

  // Log admin action
  await logAdminAction({
    adminId: (req.user as any).userId,
    action: 'user_suspended',
    resourceType: 'user',
    resourceId: userId,
    details: { user_name: updatedUser?.name, user_phone: updatedUser?.phone },
    req,
  });

  res.json(ApiResponse.success(updatedUser, 'User suspended successfully'));
});

/**
 * @desc    Activate user (set is_active = true)
 * @route   PATCH /api/users/:id/activate
 * @access  Private/Admin
 */
export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User');
  }

  if (user.is_active) {
    throw ApiError.badRequest('User is already active');
  }

  await User.updateById(userId, {
    is_active: true,
    updated_at: new Date(),
  });

  const updatedUser = await User.findById(userId);

  // Log admin action
  await logAdminAction({
    adminId: (req.user as any).userId,
    action: 'user_activated',
    resourceType: 'user',
    resourceId: userId,
    details: { user_name: updatedUser?.name, user_phone: updatedUser?.phone },
    req,
  });

  res.json(ApiResponse.success(updatedUser, 'User activated successfully'));
});
