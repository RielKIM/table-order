import { OrderModel } from '../../models/orderModel';
import type { OrderItemInput } from '../../models/orderModel';
import { MenuModel } from '../../models/menuModel';
import { TableSessionModel } from '../../models/tableSessionModel';
import { OrderHistoryModel } from '../../models/orderHistoryModel';
import { eventService } from '../events/eventService';
import type { Order, OrderHistory, OrderStatus, OrderWithItems } from '../../types';
import {
  SessionNotFoundError,
  SessionInactiveError,
  MenuNotAvailableError,
  OrderNotFoundError,
  InvalidStatusTransitionError,
} from '../../shared/errors';

interface CreateOrderInput {
  tableSessionId: number;
  menuItems: { menuId: number; quantity: number }[];
}

// 상태 전이 순위 (BR-02: pending → preparing → completed 단방향)
const STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  completed: 2,
};

// 단방향 전이 검증: 동일/역방향 금지
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_RANK[to] > STATUS_RANK[from];
}

export const OrderService = {
  // 주문 생성 (BR-01): 세션 active 확인 → 메뉴 active 확인 → 서버 금액 계산 → 생성 → SSE
  async createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
    const session = await TableSessionModel.findById(input.tableSessionId);
    if (!session) {
      throw new SessionNotFoundError();
    }
    if (!session.isActive) {
      throw new SessionInactiveError();
    }

    const menuIds = input.menuItems.map((it) => it.menuId);
    const activeMenus = await MenuModel.findActiveByIds(menuIds);
    const menuById = new Map(activeMenus.map((m) => [m.id, m]));

    // 모든 메뉴가 활성 상태인지 확인
    const items: OrderItemInput[] = [];
    let totalAmount = 0;
    for (const line of input.menuItems) {
      const menu = menuById.get(line.menuId);
      if (!menu) {
        throw new MenuNotAvailableError();
      }
      // 금액은 서버에서 계산 (클라이언트 값 신뢰 안 함)
      totalAmount += menu.price * line.quantity;
      items.push({
        menuId: menu.id,
        menuName: menu.name,
        quantity: line.quantity,
        unitPrice: menu.price,
      });
    }

    const order = await OrderModel.createWithItems(
      session.id,
      session.tableNumber,
      totalAmount,
      items
    );

    // SSE 발행
    eventService.broadcastOrderCreated(order);

    return order;
  },

  // 현재 세션 주문 조회 (BR-05)
  async getCurrentOrders(tableSessionId: number): Promise<OrderWithItems[]> {
    return OrderModel.findByTableSession(tableSessionId);
  },

  // 과거 주문 내역 조회
  async getOrderHistory(tableSessionId: number): Promise<OrderHistory[]> {
    return OrderHistoryModel.findByTableSession(tableSessionId);
  },

  // 주문 상태 변경 (BR-02): 단방향 전이 검증 → 업데이트 → SSE
  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    const current = await OrderModel.findById(orderId);
    if (!current) {
      throw new OrderNotFoundError();
    }

    if (!isValidTransition(current.status, newStatus)) {
      throw new InvalidStatusTransitionError(
        `'${current.status}' 에서 '${newStatus}' 로 전이할 수 없습니다`
      );
    }

    const updated = await OrderModel.updateStatus(orderId, newStatus);
    if (!updated) {
      throw new OrderNotFoundError();
    }

    eventService.broadcastOrderStatusChanged(updated);
    return updated;
  },

  // 주문 삭제 (관리자 직권) → SSE
  async deleteOrder(orderId: number): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const deleted = await OrderModel.delete(orderId);
    if (!deleted) {
      throw new OrderNotFoundError();
    }

    eventService.broadcastOrderDeleted(order.tableSessionId, orderId);
  },
};
