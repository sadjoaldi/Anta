import { BaseModel } from './BaseModel.js';
import { User, UserInsert, UserUpdate } from './types.js';

export class UserModel extends BaseModel<User, UserInsert, UserUpdate> {
  constructor() {
    super('users');
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phone: string): Promise<User | undefined> {
    return this.findOne({ phone });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email });
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    return this.exists({ phone });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Get active users
   */
  async getActiveUsers(limit?: number, offset?: number): Promise<User[]> {
    return this.findAll({ is_active: true }, limit, offset);
  }

  /**
   * Update user's updated_at timestamp
   */
  async touch(id: number): Promise<number> {
    return this.updateById(id, { updated_at: new Date() });
  }
}

// Export singleton instance
export default new UserModel();
