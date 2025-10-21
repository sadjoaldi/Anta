/**
 * Reviews Service (Frontend)
 * API calls for reviews management
 */

import apiClient from './api.client';

export interface CreateReviewParams {
  rideId: number;
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
  created_at: string;
  updated_at: string;
  reviewer_name?: string;
  reviewed_name?: string;
}

export interface ReviewStats {
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
  async createReview(params: CreateReviewParams): Promise<Review> {
    const review = await apiClient.post<Review>('/reviews', params);
    return review;
  }

  /**
   * Get reviews for a user
   */
  async getUserReviews(
    userId: number,
    userType: 'driver' | 'passenger' = 'driver',
    limit: number = 20,
    offset: number = 0
  ): Promise<Review[]> {
    const reviews = await apiClient.get<Review[]>(
      `/reviews/user/${userId}?userType=${userType}&limit=${limit}&offset=${offset}`
    );
    return reviews;
  }

  /**
   * Get review stats for a user
   */
  async getUserReviewStats(userId: number): Promise<ReviewStats> {
    const stats = await apiClient.get<ReviewStats>(`/reviews/user/${userId}/stats`);
    return stats;
  }

  /**
   * Get pending reviews (rides not yet reviewed)
   */
  async getPendingReviews(userType: 'driver' | 'passenger' = 'passenger'): Promise<any[]> {
    const pending = await apiClient.get<any[]>(`/reviews/pending?userType=${userType}`);
    return pending;
  }

  /**
   * Get badges for a user
   */
  async getUserBadges(userId: number): Promise<string[]> {
    const response = await apiClient.get<{ badges: string[] }>(`/reviews/user/${userId}/badges`);
    return response.badges;
  }
}

export default new ReviewsService();
