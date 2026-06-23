import db from '../config/database';
import type { TableSession } from '../types';

interface TableSessionRow {
  id: number;
  store_id: string;
  table_number: string;
  session_token: string;
  activated_at: Date | null;
  created_at: Date;
  expires_at: Date;
  is_active: boolean;
  completed_at: Date | null;
}

export interface CreateTableSessionInput {
  storeId: string;
  tableNumber: string;
  sessionToken: string;
  expiresAt: Date;
}

function mapRow(row: TableSessionRow): TableSession {
  return {
    id: row.id,
    storeId: row.store_id,
    tableNumber: row.table_number,
    sessionToken: row.session_token,
    activatedAt: row.activated_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    completedAt: row.completed_at,
  };
}

export const TableSessionModel = {
  async create(input: CreateTableSessionInput): Promise<TableSession> {
    const [row] = await db<TableSessionRow>('table_sessions')
      .insert({
        store_id: input.storeId,
        table_number: input.tableNumber,
        session_token: input.sessionToken,
        expires_at: input.expiresAt,
        is_active: true,
        activated_at: null,
      })
      .returning('*');
    return mapRow(row);
  },

  async findByToken(sessionToken: string): Promise<TableSession | null> {
    const row = await db<TableSessionRow>('table_sessions')
      .where({ session_token: sessionToken })
      .first();
    return row ? mapRow(row) : null;
  },

  async findById(id: number): Promise<TableSession | null> {
    const row = await db<TableSessionRow>('table_sessions').where({ id }).first();
    return row ? mapRow(row) : null;
  },

  async findActive(): Promise<TableSession[]> {
    const rows = await db<TableSessionRow>('table_sessions').where({ is_active: true });
    return rows.map(mapRow);
  },

  async markActivated(id: number): Promise<void> {
    await db<TableSessionRow>('table_sessions')
      .where({ id })
      .whereNull('activated_at')
      .update({ activated_at: db.fn.now() });
  },

  async complete(id: number): Promise<boolean> {
    const count = await db<TableSessionRow>('table_sessions')
      .where({ id })
      .update({ is_active: false, completed_at: db.fn.now() });
    return count > 0;
  },

  async extendExpiry(id: number, expiresAt: Date): Promise<void> {
    await db<TableSessionRow>('table_sessions')
      .where({ id })
      .update({ expires_at: expiresAt });
  },
};
