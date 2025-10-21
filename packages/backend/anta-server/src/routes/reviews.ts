/**
 * Reviews Routes
 */

import { Router, Request, Response } from 'express';
import reviewsService from '../services/reviews.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/reviews
 * Create a review
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      rideId,
      reviewedId,
      reviewerType,
      rating,
      ratingCleanliness,
      ratingPunctuality,
      ratingCommunication,
      ratingSafety,
      comment,
      tags,
    } = req.body;

    // Validate required fields
    if (!rideId || !reviewedId || !reviewerType || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await reviewsService.createReview({
      rideId,
      reviewerId: userId,
      reviewedId,
      reviewerType,
      rating,
      ratingCleanliness,
      ratingPunctuality,
      ratingCommunication,
      ratingSafety,
      comment,
      tags,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create review',
    });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get reviews for a user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userType = req.query.userType as 'driver' | 'passenger' || 'driver';
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const reviews = await reviewsService.getUserReviews(
      parseInt(userId),
      userType,
      limit,
      offset
    );

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get reviews',
    });
  }
});

/**
 * GET /api/reviews/user/:userId/stats
 * Get review stats for a user
 */
router.get('/user/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await reviewsService.getUserReviewStats(parseInt(userId));

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get user review stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get review stats',
    });
  }
});

/**
 * GET /api/reviews/pending
 * Get pending reviews for authenticated user
 */
router.get('/pending', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userType = req.query.userType as 'driver' | 'passenger' || 'passenger';

    const pendingReviews = await reviewsService.getPendingReviews(userId, userType);

    res.json({
      success: true,
      data: pendingReviews,
    });
  } catch (error: any) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get pending reviews',
    });
  }
});

/**
 * GET /api/reviews/user/:userId/badges
 * Get badges for a user
 */
router.get('/user/:userId/badges', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const badges = await reviewsService.calculateUserBadges(parseInt(userId));

    res.json({
      success: true,
      data: { badges },
    });
  } catch (error: any) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get badges',
    });
  }
});

export default router;
