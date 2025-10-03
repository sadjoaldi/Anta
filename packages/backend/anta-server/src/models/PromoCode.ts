import { BaseModel } from './BaseModel.js';
import { PromoCode, DiscountType } from './types.js';

export class PromoCodeModel extends BaseModel<PromoCode, Partial<PromoCode>, Partial<PromoCode>> {
  constructor() {
    super('promo_codes');
  }

  /**
   * Find promo code by code string
   */
  async findByCode(code: string): Promise<PromoCode | undefined> {
    return this.findOne({ code: code.toUpperCase() });
  }

  /**
   * Check if promo code is valid
   */
  async isValid(code: string): Promise<boolean> {
    const promo = await this.db('promo_codes')
      .where('code', code.toUpperCase())
      .where('active', true)
      .where(function() {
        this.whereNull('valid_from').orWhere('valid_from', '<=', new Date());
      })
      .where(function() {
        this.whereNull('valid_to').orWhere('valid_to', '>=', new Date());
      })
      .where(function() {
        this.whereNull('usage_limit').orWhereRaw('usage_limit > 0');
      })
      .first();
    
    return !!promo;
  }

  /**
   * Get active promo codes
   */
  async getActivePromoCodes(): Promise<PromoCode[]> {
    return this.db('promo_codes')
      .where('active', true)
      .where(function() {
        this.whereNull('valid_from').orWhere('valid_from', '<=', new Date());
      })
      .where(function() {
        this.whereNull('valid_to').orWhere('valid_to', '>=', new Date());
      });
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(promo: PromoCode, originalAmount: number): number {
    if (promo.discount_type === 'percent') {
      return Math.round((originalAmount * promo.value) / 100);
    } else {
      return Math.min(promo.value, originalAmount);
    }
  }

  /**
   * Apply promo code (decrement usage limit)
   */
  async applyPromoCode(code: string): Promise<boolean> {
    const result = await this.db.raw(
      `UPDATE promo_codes 
       SET usage_limit = CASE 
         WHEN usage_limit IS NULL THEN NULL 
         ELSE usage_limit - 1 
       END
       WHERE code = ? AND active = true AND (usage_limit IS NULL OR usage_limit > 0)`,
      [code.toUpperCase()]
    );
    
    return result[0].affectedRows > 0;
  }

  /**
   * Deactivate promo code
   */
  async deactivate(id: number): Promise<number> {
    return this.updateById(id, { active: false });
  }
}

// Export singleton instance
export default new PromoCodeModel();
