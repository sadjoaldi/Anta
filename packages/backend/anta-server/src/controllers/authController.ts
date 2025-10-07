import crypto from "crypto";
import { Request, Response } from "express";
import Driver from "../models/Driver.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt.js";
import {
  comparePassword,
  hashPassword,
  validatePasswordStrength,
} from "../utils/password.js";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { phone, email, name, password, role } = req.body;

  // Validate required fields
  if (!phone || !name || !password) {
    throw ApiError.badRequest("Phone, name, and password are required");
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw ApiError.badRequest("Password does not meet requirements", {
      errors: passwordValidation.errors,
    });
  }

  // Check if user already exists
  if (await User.phoneExists(phone)) {
    throw ApiError.conflict("Phone number already registered");
  }

  if (email && (await User.emailExists(email))) {
    throw ApiError.conflict("Email already registered");
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Determine user role (passenger by default, admin/driver if specified)
  const userRole = role === "admin" ? "admin" : role === "driver" ? "driver" : "passenger";

  // Create user
  const userId = await User.create({
    phone,
    email,
    name,
    password_hash,
    role: userRole,
    is_active: true,
  });

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.internal("Failed to create user");
  }

  // If registering as driver, create driver profile automatically
  if (userRole === "driver") {
    await Driver.create({
      user_id: user.id,
      status: "offline",
      kyc_status: "pending",
      rating_avg: 5.0,
      total_trips: 0,
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    phone: user.phone,
    role: userRole,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    phone: user.phone,
    role: userRole,
  });

  // Store refresh token hash in session
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await Session.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Remove password from response
  const { password_hash: _, ...userWithoutPassword } = user;

  // Check if user is also a driver (in case registered as driver)
  const driver = await Driver.findByUserId(user.id).catch(() => null);

  res.status(201).json(
    ApiResponse.success({
      user: {
        ...userWithoutPassword,
        driver: driver || null,  // Include driver profile if exists
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: "7d",
      },
    })
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  // Validate input
  if (!phone || !password) {
    throw ApiError.badRequest("Phone and password are required");
  }

  // Find user
  const user = await User.findByPhone(phone);
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check if user is active
  if (!user.is_active) {
    throw ApiError.forbidden("Account is deactivated");
  }

  // Use role from database
  const userRole = user.role;

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    phone: user.phone,
    role: userRole,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    phone: user.phone,
    role: userRole,
  });

  // Store refresh token hash in session
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await Session.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Update last login
  await User.touch(user.id);

  // Remove password from response
  const { password_hash: _, ...userWithoutPassword } = user;

  // Check if user is also a driver
  const driver = await Driver.findByUserId(user.id).catch(() => null);

  res.json(
    ApiResponse.success({
      user: { 
        ...userWithoutPassword, 
        role: userRole,
        driver: driver || null,  // Include driver profile if exists
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: "7d",
      },
    })
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  // Verify token
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  // Check if refresh token exists in database
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const isValid = await Session.isValid(tokenHash);

  if (!isValid) {
    throw ApiError.unauthorized("Refresh token has been revoked");
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: payload.userId,
    phone: payload.phone,
    role: payload.role,
  });

  res.json(
    ApiResponse.success({
      accessToken,
      expiresIn: "7d",
    })
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke refresh token
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await Session.deleteByTokenHash(tokenHash);
  }

  res.json(ApiResponse.success({ message: "Logged out successfully" }));
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  // Delete all sessions for user
  await Session.deleteUserSessions(req.user.userId);

  res.json(ApiResponse.success({ message: "Logged out from all devices" }));
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw ApiError.notFound("User");
  }

  // Remove password from response
  const { password_hash: _, ...userWithoutPassword } = user;

  // Check if user is also a driver
  const driver = await Driver.findByUserId(user.id).catch(() => null);

  res.json(
    ApiResponse.success({
      ...userWithoutPassword,
      // Use role from database (most up-to-date), not from JWT token
      driver: driver || null,
    })
  );
});

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest(
        "Current password and new password are required"
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw ApiError.badRequest("New password does not meet requirements", {
        errors: passwordValidation.errors,
      });
    }

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw ApiError.notFound("User");
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      currentPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await User.updateById(user.id, { password_hash: newPasswordHash });

    // Invalidate all sessions (force re-login)
    await Session.deleteUserSessions(user.id);

    res.json(
      ApiResponse.success({
        message: "Password changed successfully. Please login again.",
      })
    );
  }
);

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  changePassword,
};
