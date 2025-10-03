import { BaseModel } from './BaseModel.js';
import { Wallet, OwnerType } from './types.js';

export class WalletModel extends BaseModel<Wallet, Partial<Wallet>, Partial<Wallet>> {
  constructor() {
    super('wallets');
  }

  /**
   * Get wallet by owner
   */
  async getByOwner(ownerType: OwnerType, ownerId: number): Promise<Wallet | undefined> {
    return this.findOne({ owner_type: ownerType, owner_id: ownerId });
  }

  /**
   * Get or create wallet for owner
   */
  async getOrCreate(ownerType: OwnerType, ownerId: number, currency = 'EUR'): Promise<Wallet> {
    let wallet = await this.getByOwner(ownerType, ownerId);
    
    if (!wallet) {
      const id = await this.create({
        owner_type: ownerType,
        owner_id: ownerId,
        balance_cents: 0,
        currency
      });
      wallet = await this.findById(id);
    }
    
    return wallet!;
  }

  /**
   * Add funds to wallet
   */
  async addFunds(ownerType: OwnerType, ownerId: number, amountCents: number): Promise<void> {
    await this.db.raw(
      'UPDATE wallets SET balance_cents = balance_cents + ? WHERE owner_type = ? AND owner_id = ?',
      [amountCents, ownerType, ownerId]
    );
  }

  /**
   * Deduct funds from wallet
   */
  async deductFunds(ownerType: OwnerType, ownerId: number, amountCents: number): Promise<boolean> {
    const result = await this.db.raw(
      'UPDATE wallets SET balance_cents = balance_cents - ? WHERE owner_type = ? AND owner_id = ? AND balance_cents >= ?',
      [amountCents, ownerType, ownerId, amountCents]
    );
    return result[0].affectedRows > 0;
  }

  /**
   * Get wallet balance
   */
  async getBalance(ownerType: OwnerType, ownerId: number): Promise<number> {
    const wallet = await this.getByOwner(ownerType, ownerId);
    return wallet?.balance_cents || 0;
  }

  /**
   * Transfer funds between wallets
   */
  async transfer(
    fromType: OwnerType,
    fromId: number,
    toType: OwnerType,
    toId: number,
    amountCents: number
  ): Promise<boolean> {
    const trx = await this.db.transaction();
    
    try {
      // Deduct from source
      const deducted = await trx.raw(
        'UPDATE wallets SET balance_cents = balance_cents - ? WHERE owner_type = ? AND owner_id = ? AND balance_cents >= ?',
        [amountCents, fromType, fromId, amountCents]
      );
      
      if (deducted[0].affectedRows === 0) {
        await trx.rollback();
        return false;
      }
      
      // Add to destination
      await trx.raw(
        'UPDATE wallets SET balance_cents = balance_cents + ? WHERE owner_type = ? AND owner_id = ?',
        [amountCents, toType, toId]
      );
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

// Export singleton instance
export default new WalletModel();
