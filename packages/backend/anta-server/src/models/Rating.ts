import { BaseModel } from './BaseModel.js';
import { Rating, RatingInsert } from './types.js';

export class RatingModel extends BaseModel<Rating, RatingInsert, Partial<Rating>> {
  constructor() {
    super('ratings');
  }

  /**
   * Get ratings for a user (driver or passenger)
   */
  async getRatingsForUser(userId: number, limit?: number, offset?: number): Promise<Rating[]> {
    return this.findAll({ to_user_id: userId }, limit, offset);
  }

  /**
   * Get ratings by a user
   */
  async getRatingsByUser(userId: number, limit?: number, offset?: number): Promise<Rating[]> {
    return this.findAll({ from_user_id: userId }, limit, offset);
  }

  /**
   * Get rating for a specific trip
   */
  async getRatingForTrip(tripId: number, fromUserId?: number): Promise<Rating | undefined> {
    const where: Partial<Rating> = { trip_id: tripId };
    if (fromUserId) {
      where.from_user_id = fromUserId;
    }
    return this.findOne(where);
  }

  /**
   * Calculate average rating for a user
   */
  async getAverageRating(userId: number): Promise<number> {
    const result = await this.db('ratings')
      .avg('rating as avg')
      .where('to_user_id', userId)
      .first();
    return result?.avg ? parseFloat(result.avg) : 0;
  }

  /**
   * Get rating statistics for a user
   */
  async getRatingStats(userId: number) {
    const result = await this.db('ratings')
      .select(
        this.db.raw('AVG(rating) as average'),
        this.db.raw('COUNT(*) as total'),
        this.db.raw('SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star'),
        this.db.raw('SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star'),
        this.db.raw('SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star'),
        this.db.raw('SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star'),
        this.db.raw('SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star')
      )
      .where('to_user_id', userId)
      .first();

    return {
      average: result?.average ? parseFloat(result.average) : 0,
      total: result?.total || 0,
      distribution: {
        5: result?.five_star || 0,
        4: result?.four_star || 0,
        3: result?.three_star || 0,
        2: result?.two_star || 0,
        1: result?.one_star || 0
      }
    };
  }

  /**
   * Check if user has already rated a trip
   */
  async hasRatedTrip(tripId: number, fromUserId: number): Promise<boolean> {
    return this.exists({ trip_id: tripId, from_user_id: fromUserId });
  }
}

// Export singleton instance
export default new RatingModel();
