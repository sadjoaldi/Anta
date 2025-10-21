/**
 * Reviews Service
 * Manages ride reviews and ratings
 */

import knex from '../utils/knex.js';

export interface CreateReviewDto {
  rideId: number;
  reviewerId: number;
  reviewedId: number;
  reviewerType: 'passenger' | 'driver';
  rating: number;
  ratingCleanliness?: number;
  ratingPunctuality?: number;
  ratingCommunication?: number;
  ratingSafety?: number;
  comment?: string;
  tags?: string[];
}

export interface Review {
  id: number;
  ride_id: number;
  reviewer_id: number;
  reviewed_id: number;
  reviewer_type: 'passenger' | 'driver';
  rating: number;
  rating_cleanliness?: number;
  rating_punctuality?: number;
  rating_communication?: number;
  rating_safety?: number;
  comment?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  // Populated fields
  reviewer_name?: string;
  reviewed_name?: string;
}

export interface UserReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    stars_5: number;
    stars_4: number;
    stars_3: number;
    stars_2: number;
    stars_1: number;
  };
  recent_reviews: Review[];
}

class ReviewsService {
  /**
   * Create a review
   */
  async createReview(data: CreateReviewDto): Promise<Review> {
    try {
      // Validate rating
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if review already exists
      const existing = await knex('reviews')
        .where({ ride_id: data.rideId, reviewer_id: data.reviewerId })
        .first();

      if (existing) {
        throw new Error('Review already exists for this ride');
      }

      // Create review
      const [id] = await knex('reviews').insert({
        ride_id: data.rideId,
        reviewer_id: data.reviewerId,
        reviewed_id: data.reviewedId,
        reviewer_type: data.reviewerType,
        rating: data.rating,
        rating_cleanliness: data.ratingCleanliness,
        rating_punctuality: data.ratingPunctuality,
        rating_communication: data.ratingCommunication,
        rating_safety: data.ratingSafety,
        comment: data.comment,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

      // Update driver/user rating average
      await this.updateUserRatingAverage(data.reviewedId, data.reviewerType === 'passenger' ? 'driver' : 'passenger');

      const review = await this.getReviewById(id);
      return review;
    } catch (error: any) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review: ' + error.message);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: number): Promise<Review> {
    const review = await knex('reviews')
      .select(
        'reviews.*',
        'reviewer_user.name as reviewer_name',
        'reviewed_user.name as reviewed_name'
      )
      .leftJoin('users as reviewer_user', 'reviews.reviewer_id', 'reviewer_user.id')
      .leftJoin('users as reviewed_user', 'reviews.reviewed_id', 'reviewed_user.id')
      .where({ 'reviews.id': reviewId })
      .first();

    if (!review) {
      throw new Error('Review not found');
    }

    // Parse JSON tags
    if (review.tags) {
      review.tags = JSON.parse(review.tags);
    }

    return review;
  }

  /**
   * Get reviews for a user (driver or passenger)
   */
  async getUserReviews(
    userId: number,
    userType: 'driver' | 'passenger',
    limit: number = 20,
    offset: number = 0
  ): Promise<Review[]> {
    const reviews = await knex('reviews')
      .select(
        'reviews.*',
        'reviewer_user.name as reviewer_name'
      )
      .leftJoin('users as reviewer_user', 'reviews.reviewer_id', 'reviewer_user.id')
      .where({ 'reviews.reviewed_id': userId })
      .orderBy('reviews.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse JSON tags
    return reviews.map((review) => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : null,
    }));
  }

  /**
   * Get review stats for a user
   */
  async getUserReviewStats(userId: number): Promise<UserReviewStats> {
    const reviews = await knex('reviews')
      .select(
        'reviews.*',
        'reviewer_user.name as reviewer_name'
      )
      .leftJoin('users as reviewer_user', 'reviews.reviewer_id', 'reviewer_user.id')
      .where({ 'reviews.reviewed_id': userId })
      .orderBy('reviews.created_at', 'desc');

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      stars_5: reviews.filter(r => r.rating === 5).length,
      stars_4: reviews.filter(r => r.rating === 4).length,
      stars_3: reviews.filter(r => r.rating === 3).length,
      stars_2: reviews.filter(r => r.rating === 2).length,
      stars_1: reviews.filter(r => r.rating === 1).length,
    };

    const recentReviews = reviews.slice(0, 5).map((review) => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : null,
    }));

    return {
      total_reviews: totalReviews,
      average_rating: averageRating,
      rating_distribution: ratingDistribution,
      recent_reviews: recentReviews,
    };
  }

  /**
   * Update user's average rating
   */
  private async updateUserRatingAverage(userId: number, userType: 'driver' | 'passenger'): Promise<void> {
    const result = await knex('reviews')
      .where({ reviewed_id: userId })
      .avg('rating as avg_rating')
      .count('id as total')
      .first();

    const avgRating = parseFloat(result?.avg_rating || '0');
    const totalReviews = parseInt(result?.total || '0');

    if (userType === 'driver') {
      // Update driver table
      await knex('drivers')
        .where({ user_id: userId })
        .update({
          rating_avg: avgRating,
          total_reviews: totalReviews,
        });
    }
    // For passengers, we might want to track this in the users table in the future
  }

  /**
   * Get pending reviews for a user (rides they haven't reviewed yet)
   */
  async getPendingReviews(userId: number, userType: 'driver' | 'passenger'): Promise<any[]> {
    const completedRides = await knex('rides')
      .select('rides.*')
      .leftJoin('reviews', function() {
        this.on('reviews.ride_id', '=', 'rides.id')
          .andOn('reviews.reviewer_id', '=', knex.raw('?', [userId]));
      })
      .where({ 'rides.status': 'completed' })
      .whereNull('reviews.id') // No review exists
      .andWhere(
        userType === 'driver' ? { 'rides.driver_id': userId } : { 'rides.passenger_id': userId }
      )
      .orderBy('rides.completed_at', 'desc')
      .limit(10);

    return completedRides;
  }

  /**
   * Calculate badges based on reviews
   */
  async calculateUserBadges(userId: number): Promise<string[]> {
    const stats = await this.getUserReviewStats(userId);
    const badges: string[] = [];

    // Top driver badge (4.8+ rating with 50+ reviews)
    if (stats.average_rating >= 4.8 && stats.total_reviews >= 50) {
      badges.push('top_driver');
    }

    // Experienced badge (100+ trips)
    const driver = await knex('drivers').where({ user_id: userId }).first();
    if (driver && driver.total_trips >= 100) {
      badges.push('experienced');
    }

    // Analyze tags from recent reviews
    const allTags = stats.recent_reviews.flatMap(r => r.tags || []);
    const tagCounts: { [key: string]: number } = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Award badges based on frequent tags
    if (tagCounts['Ponctuel'] >= 3) badges.push('punctual');
    if (tagCounts['Sympathique'] >= 3) badges.push('friendly');
    if (tagCounts['Véhicule propre'] >= 3) badges.push('clean_vehicle');
    if (tagCounts['Conduite sûre'] >= 3) badges.push('safe_driver');

    return badges;
  }
}

export default new ReviewsService();
