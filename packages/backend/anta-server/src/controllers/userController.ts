import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const users = await User.findAll(undefined, limit, offset);
  const total = await User.count();

  res.json(ApiResponse.paginated(users, page, limit, total));
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
