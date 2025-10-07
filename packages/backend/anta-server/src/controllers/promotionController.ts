import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import knex from '../utils/knex.js';
import type { Promotion, PromotionUpdate } from '../models/types.js';

/**
 * @desc    Get all promotions
 * @route   GET /api/promotions
 * @access  Private/Admin
 */
export const getPromotions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const is_active = req.query.is_active as string;

  let query = knex('promotions').select('*');

  if (is_active !== undefined) {
    query = query.where('is_active', is_active === 'true');
  }

  const promotions = await query.limit(limit).offset(offset);
  const [{ count }] = await knex('promotions').count('* as count');

  res.json(ApiResponse.paginated(promotions, page, limit, count));
});

/**
 * @desc    Get promotion by ID
 * @route   GET /api/promotions/:id
 * @access  Private/Admin
 */
export const getPromotionById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const promotion = await knex('promotions').where({ id }).first();

  if (!promotion) {
    throw ApiError.notFound('Promotion');
  }

  res.json(ApiResponse.success(promotion));
});

/**
 * @desc    Create promotion
 * @route   POST /api/promotions
 * @access  Private/Admin
 */
export const createPromotion = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    description,
    type,
    value,
    min_trip_amount,
    max_discount,
    usage_limit,
    usage_per_user,
    valid_from,
    valid_until,
  } = req.body;

  // Check if code already exists
  const existing = await knex('promotions').where({ code }).first();
  if (existing) {
    throw ApiError.conflict('Code promo déjà existant');
  }

  const [id] = await knex('promotions').insert({
    code,
    description,
    type,
    value,
    min_trip_amount,
    max_discount,
    usage_limit,
    usage_per_user,
    valid_from,
    valid_until,
    is_active: true,
    usage_count: 0,
  });

  const promotion = await knex('promotions').where({ id }).first();
  res.status(201).json(ApiResponse.success(promotion, 'Promotion créée avec succès'));
});

/**
 * @desc    Update promotion
 * @route   PUT /api/promotions/:id
 * @access  Private/Admin
 */
export const updatePromotion = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updates: PromotionUpdate = req.body;

  const promotion = await knex('promotions').where({ id }).first();
  if (!promotion) {
    throw ApiError.notFound('Promotion');
  }

  // If updating code, check if new code exists
  if (updates.code && updates.code !== promotion.code) {
    const existing = await knex('promotions').where({ code: updates.code }).first();
    if (existing) {
      throw ApiError.conflict('Code promo déjà existant');
    }
  }

  await knex('promotions')
    .where({ id })
    .update({
      ...updates,
      updated_at: new Date(),
    });

  const updated = await knex('promotions').where({ id }).first();
  res.json(ApiResponse.success(updated, 'Promotion mise à jour avec succès'));
});

/**
 * @desc    Toggle promotion active status
 * @route   PATCH /api/promotions/:id/toggle
 * @access  Private/Admin
 */
export const togglePromotionStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const promotion = await knex('promotions').where({ id }).first();
  if (!promotion) {
    throw ApiError.notFound('Promotion');
  }

  await knex('promotions')
    .where({ id })
    .update({
      is_active: !promotion.is_active,
      updated_at: new Date(),
    });

  const updated = await knex('promotions').where({ id }).first();
  const message = updated.is_active ? 'Promotion activée' : 'Promotion désactivée';
  res.json(ApiResponse.success(updated, message));
});

/**
 * @desc    Delete promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private/Admin
 */
export const deletePromotion = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const promotion = await knex('promotions').where({ id }).first();
  if (!promotion) {
    throw ApiError.notFound('Promotion');
  }

  await knex('promotions').where({ id }).del();
  res.json(ApiResponse.success({ message: 'Promotion supprimée avec succès' }));
});

/**
 * @desc    Get promotion usage stats
 * @route   GET /api/promotions/:id/stats
 * @access  Private/Admin
 */
export const getPromotionStats = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const promotion = await knex('promotions').where({ id }).first();
  if (!promotion) {
    throw ApiError.notFound('Promotion');
  }

  const [totalUsage] = await knex('promotion_usages')
    .where({ promotion_id: id })
    .count('* as count');

  const [totalDiscount] = await knex('promotion_usages')
    .where({ promotion_id: id })
    .sum('discount_amount as total');

  const uniqueUsers = await knex('promotion_usages')
    .where({ promotion_id: id })
    .countDistinct('user_id as count');

  res.json(
    ApiResponse.success({
      promotion,
      stats: {
        total_uses: totalUsage.count,
        total_discount: totalDiscount.total || 0,
        unique_users: uniqueUsers[0].count,
      },
    })
  );
});
