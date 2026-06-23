import db from '../config/database';
import type { Knex } from 'knex';
import type { OrderHistory, OrderItem } from '../types';

interface OrderHistoryRow {
  id: number;
  order_id: number;
  table_session_id: number;
  table_number: string;
  status: string;
  total_amount: number;
  items_snapshot: OrderItem[];
  created_at: Date;
  completed_at: Date;
  archived_at: Date;
}

export interface ArchiveInput {
  orderId: number;
  tableSessionId: number;
  tableNumber: string;
  status: string;
  totalAmount: number;
  itemsSnapshot: OrderItem[];
  createdAt: Date;
  completedAt: Date;
}

function mapRow(row: OrderHistoryRow): OrderHistory {
  return {
    id: row.id,
    orderId: row.order_id,
    tableSessionId: row.table_session_id,
    tableNumber: row.table_number,
    status: row.status,
    totalAmount: row.total_amount,
    itemsSnapshot: row.items_snapshot,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  };
}

export const OrderHistoryModel = {
  async archive(input: ArchiveInput, trx?: Knex.Transaction): Promise<void> {
    const query = (trx ?? db)<OrderHistoryRow>('order_history').insert({
      order_id: input.orderId,
      table_session_id: input.tableSessionId,
      table_number: input.tableNumber,
      status: input.status,
      total_amount: input.totalAmount,
      // jsonb 컬럼: 문자열로 직렬화하여 저장 (타입은 OrderItem[]이므로 캐스팅)
      items_snapshot: JSON.stringify(input.itemsSnapshot) as unknown as OrderItem[],
      created_at: input.createdAt,
      completed_at: input.completedAt,
    });
    await query;
  },

  async findByTableSession(tableSessionId: number): Promise<OrderHistory[]> {
    const rows = await db<OrderHistoryRow>('order_history')
      .where({ table_session_id: tableSessionId })
      .orderBy('completed_at', 'desc');
    return rows.map(mapRow);
  },

  async findByTableNumber(
    tableNumber: string,
    dateFilter?: { from: Date; to: Date }
  ): Promise<OrderHistory[]> {
    const query = db<OrderHistoryRow>('order_history').where({ table_number: tableNumber });
    if (dateFilter) {
      query.andWhereBetween('completed_at', [dateFilter.from, dateFilter.to]);
    }
    const rows = await query.orderBy('completed_at', 'desc');
    return rows.map(mapRow);
  },
};
