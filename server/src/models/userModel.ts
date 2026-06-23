import db from '../config/database';
import type { User } from '../types';

interface UserRow {
  id: number;
  store_id: string;
  username: string;
  hashed_password: string;
  failed_attempts: number;
  locked_until: Date | null;
  created_at: Date;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    storeId: row.store_id,
    username: row.username,
    hashedPassword: row.hashed_password,
    failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
  };
}

export const UserModel = {
  async findByStoreAndUsername(storeId: string, username: string): Promise<User | null> {
    const row = await db<UserRow>('users')
      .where({ store_id: storeId, username })
      .first();
    return row ? mapRow(row) : null;
  },

  async findByStoreId(storeId: string): Promise<User | null> {
    const row = await db<UserRow>('users').where({ store_id: storeId }).first();
    return row ? mapRow(row) : null;
  },

  async incrementFailedAttempts(userId: number, lockedUntil: Date | null): Promise<void> {
    await db<UserRow>('users')
      .where({ id: userId })
      .update({
        failed_attempts: db.raw('failed_attempts + 1'),
        locked_until: lockedUntil,
      });
  },

  async resetFailedAttempts(userId: number): Promise<void> {
    await db<UserRow>('users')
      .where({ id: userId })
      .update({ failed_attempts: 0, locked_until: null });
  },
};
