/**
 * orderStore — 주문 (고객 + 관리자 공용)
 *
 * 고객(US-C09 ~ C11):
 *  - createOrder, fetchCurrentOrders, applySSEUpdate
 * 관리자(US-A03 ~ A09):
 *  - dashboardItems, fetchDashboard, updateOrderStatus, deleteOrder, fetchHistory
 */
import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/services/api';
import type {
  CartItem,
  CreateOrderInput,
  OrderStatus,
  OrderWithItems,
  SSEEvent,
  OrderStatusChangedPayload,
  OrderDeletedPayload,
  TableDashboardItem,
} from '@/shared/types';

interface OrderState {
  // 고객: 현재 세션 주문
  currentOrders: OrderWithItems[];
  loading: boolean;
  error: string | null;

  // 관리자: 대시보드
  dashboardItems: TableDashboardItem[];
  dashboardLoading: boolean;

  // 관리자: 과거 내역
  history: OrderWithItems[];
  historyLoading: boolean;

  // --- 고객 액션 ---
  createOrder: (tableSessionId: number, items: CartItem[]) => Promise<OrderWithItems>;
  fetchCurrentOrders: (tableSessionId: number) => Promise<void>;
  applySSEUpdate: (event: SSEEvent) => void;

  // --- 관리자 액션 ---
  fetchDashboard: () => Promise<void>;
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
  fetchHistory: (tableSessionId: number, date?: string) => Promise<OrderWithItems[]>;
}

/** CartItem[] → 주문 생성 payload 항목으로 변환 */
function toOrderItems(items: CartItem[]): CreateOrderInput['items'] {
  return items.map((item) => ({
    menuId: item.menu.id,
    quantity: item.quantity,
    unitPrice: item.menu.price,
  }));
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrders: [],
  loading: false,
  error: null,

  dashboardItems: [],
  dashboardLoading: false,

  history: [],
  historyLoading: false,

  // -----------------------------------------------------------------------
  // 고객
  // -----------------------------------------------------------------------
  createOrder: async (tableSessionId, items) => {
    set({ loading: true, error: null });
    try {
      const payload: CreateOrderInput = {
        tableSessionId,
        items: toOrderItems(items),
      };
      const order = await apiPost<OrderWithItems>('/orders', payload);
      set((state) => ({
        currentOrders: [order, ...state.currentOrders],
        loading: false,
      }));
      return order;
    } catch (error) {
      const message = error instanceof Error ? error.message : '주문에 실패했습니다.';
      set({ loading: false, error: message });
      throw error;
    }
  },

  fetchCurrentOrders: async (tableSessionId) => {
    set({ loading: true, error: null });
    try {
      const orders = await apiGet<OrderWithItems[]>(
        `/orders/current/${tableSessionId}`,
      );
      // 주문 시간 순(최신 먼저) 정렬
      const sorted = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      set({ currentOrders: sorted, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '주문 내역을 불러오지 못했습니다.';
      set({ loading: false, error: message });
    }
  },

  applySSEUpdate: (event) => {
    switch (event.type) {
      case 'order_created': {
        const order = event.data as OrderWithItems;
        set((state) => {
          if (state.currentOrders.some((o) => o.id === order.id)) {
            return state;
          }
          return { currentOrders: [order, ...state.currentOrders] };
        });
        break;
      }
      case 'order_status_changed': {
        const payload = event.data as OrderStatusChangedPayload;
        set((state) => ({
          currentOrders: state.currentOrders.map((o) =>
            o.id === payload.id ? { ...o, status: payload.status } : o,
          ),
        }));
        break;
      }
      case 'order_deleted': {
        const payload = event.data as OrderDeletedPayload;
        set((state) => ({
          currentOrders: state.currentOrders.filter((o) => o.id !== payload.id),
        }));
        break;
      }
      default:
        // connected / ping 등은 무시
        break;
    }
  },

  // -----------------------------------------------------------------------
  // 관리자
  // -----------------------------------------------------------------------
  fetchDashboard: async () => {
    set({ dashboardLoading: true, error: null });
    try {
      const items = await apiGet<TableDashboardItem[]>('/orders/dashboard');
      set({ dashboardItems: items, dashboardLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '대시보드를 불러오지 못했습니다.';
      set({ dashboardLoading: false, error: message });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await apiPut<OrderWithItems>(`/orders/${orderId}/status`, { status });
      set((state) => ({
        currentOrders: state.currentOrders.map((o) =>
          o.id === orderId ? { ...o, status } : o,
        ),
        dashboardItems: state.dashboardItems.map((item) => ({
          ...item,
          latestOrder:
            item.latestOrder && item.latestOrder.id === orderId
              ? { ...item.latestOrder, status }
              : item.latestOrder,
          orders: item.orders?.map((o) =>
            o.id === orderId ? { ...o, status } : o,
          ),
        })),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '상태 변경에 실패했습니다.';
      set({ error: message });
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await apiDelete<void>(`/orders/${orderId}`);
      set((state) => ({
        currentOrders: state.currentOrders.filter((o) => o.id !== orderId),
        dashboardItems: state.dashboardItems.map((item) => {
          const orders = item.orders?.filter((o) => o.id !== orderId);
          const totalAmount = orders
            ? orders.reduce((sum, o) => sum + o.totalAmount, 0)
            : item.totalAmount;
          return {
            ...item,
            orders,
            orderCount: orders ? orders.length : item.orderCount,
            totalAmount,
          };
        }),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '주문 삭제에 실패했습니다.';
      set({ error: message });
      throw error;
    }
  },

  fetchHistory: async (tableSessionId, date) => {
    set({ historyLoading: true, error: null });
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const orders = await apiGet<OrderWithItems[]>(
        `/orders/history/${tableSessionId}${query}`,
      );
      const sorted = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      set({ history: sorted, historyLoading: false });
      return sorted;
    } catch (error) {
      const message = error instanceof Error ? error.message : '과거 내역을 불러오지 못했습니다.';
      set({ historyLoading: false, error: message });
      return [];
    }
  },
}));
