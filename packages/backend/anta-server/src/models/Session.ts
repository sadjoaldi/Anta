import { BaseModel } from './BaseModel.js';
import { Session, SessionInsert } from './types.js';

export class SessionModel extends BaseModel<Session, SessionInsert, Partial<Session>> {
  constructor() {
    super('sessions');
  }

  /**
   * Find session by token hash
   */
  async findByTokenHash(tokenHash: string): Promise<Session | undefined> {
    return this.findOne({ token_hash: tokenHash });
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: number): Promise<Session[]> {
    return this.findAll({ user_id: userId });
  }

  /**
   * Get active sessions for a user (not expired)
   */
  async getActiveSessions(userId: number): Promise<Session[]> {
    return this.db('sessions')
      .where('user_id', userId)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');
  }

  /**
   * Check if session is valid (exists and not expired)
   */
  async isValid(tokenHash: string): Promise<boolean> {
    const session = await this.db('sessions')
      .where('token_hash', tokenHash)
      .where('expires_at', '>', new Date())
      .first();
    return !!session;
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<number> {
    return this.db('sessions')
      .where('expires_at', '<', new Date())
      .delete();
  }

  /**
   * Delete all sessions for a user (logout all devices)
   */
  async deleteUserSessions(userId: number): Promise<number> {
    return this.delete({ user_id: userId });
  }

  /**
   * Delete session by token hash (logout)
   */
  async deleteByTokenHash(tokenHash: string): Promise<number> {
    return this.db('sessions')
      .where('token_hash', tokenHash)
      .delete();
  }

  /**
   * Extend session expiration
   */
  async extendSession(tokenHash: string, expiresAt: Date): Promise<number> {
    return this.db('sessions')
      .where('token_hash', tokenHash)
      .update({ expires_at: expiresAt });
  }
}

// Export singleton instance
export default new SessionModel();
