import db from '../config/database';
import type { Knex } from 'knex';
import type { Order, OrderItem, OrderStatus, OrderWithItems } from '../types';

interface OrderRow {
  id: number;
  table_session_id: number;
  table_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow {
  id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderItemInput {
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    tableSessionId: row.table_session_id,
    tableNumber: row.table_number,
    status: row.status,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    menuId: row.menu_id,
    menuName: row.menu_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
  };
}

export const OrderModel = {
  // 트랜잭션 내에서 주문 + 항목 생성
  async createWithItems(
    tableSessionId: number,
    tableNumber: string,
    totalAmount: number,
    items: OrderItemInput[]
  ): Promise<OrderWithItems> {
    return db.transaction(async (trx: Knex.Transaction) => {
      // 세션 첫 주문이면 activated_at 기록
      await trx('table_sessions')
        .where({ id: tableSessionId })
        .whereNull('activated_at')
        .update({ activated_at: trx.fn.now() });

      const [orderRow] = await trx<OrderRow>('orders')
        .insert({
          table_session_id: tableSessionId,
          table_number: tableNumber,
          status: 'pending',
          total_amount: totalAmount,
        })
        .returning('*');

      const itemRows = await trx<OrderItemRow>('order_items')
        .insert(
          items.map((it) => ({
            order_id: orderRow.id,
            menu_id: it.menuId,
            menu_name: it.menuName,
            quantity: it.quantity,
            unit_price: it.unitPrice,
          }))
        )
        .returning('*');

      return { ...mapOrder(orderRow), items: itemRows.map(mapItem) };
    });
  },

  async findById(id: number): Promise<Order | null> {
    const row = await db<OrderRow>('orders').where({ id }).first();
    return row ? mapOrder(row) : null;
  },

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    const rows = await db<OrderItemRow>('order_items').where({ order_id: orderId });
    return rows.map(mapItem);
  },

  async findByTableSession(tableSessionId: number): Promise<OrderWithItems[]> {
    const orderRows = await db<OrderRow>('orders')
      .where({ table_session_id: tableSessionId })
      .orderBy('created_at', 'asc');

    const result: OrderWithItems[] = [];
    for (const orderRow of orderRows) {
      const items = await this.findItemsByOrderId(orderRow.id);
      result.push({ ...mapOrder(orderRow), items });
    }
    return result;
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const [row] = await db<OrderRow>('orders')
      .where({ id })
      .update({ status, updated_at: db.fn.now() })
      .returning('*');
    return row ? mapOrder(row) : null;
  },

  async delete(id: number): Promise<boolean> {
    const count = await db<OrderRow>('orders').where({ id }).del();
    return count > 0;
  },
};
