import { OrderService, isValidTransition } from './orderService';
import { OrderModel } from '../../models/orderModel';
import { MenuModel } from '../../models/menuModel';
import { TableSessionModel } from '../../models/tableSessionModel';
import { eventService } from '../events/eventService';
import {
  SessionNotFoundError,
  SessionInactiveError,
  MenuNotAvailableError,
  OrderNotFoundError,
  InvalidStatusTransitionError,
} from '../../shared/errors';
import type { Menu, Order, OrderWithItems, TableSession } from '../../types';

jest.mock('../../models/orderModel');
jest.mock('../../models/menuModel');
jest.mock('../../models/tableSessionModel');
jest.mock('../events/eventService', () => ({
  eventService: {
    broadcastOrderCreated: jest.fn(),
    broadcastOrderStatusChanged: jest.fn(),
    broadcastOrderDeleted: jest.fn(),
    broadcastTableSessionCompleted: jest.fn(),
  },
}));

const mockedOrderModel = OrderModel as jest.Mocked<typeof OrderModel>;
const mockedMenuModel = MenuModel as jest.Mocked<typeof MenuModel>;
const mockedSessionModel = TableSessionModel as jest.Mocked<typeof TableSessionModel>;
const mockedEvents = eventService as jest.Mocked<typeof eventService>;

function buildSession(overrides: Partial<TableSession> = {}): TableSession {
  return {
    id: 1,
    storeId: 'store-1',
    tableNumber: 'A1',
    sessionToken: 'token',
    activatedAt: null,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    isActive: true,
    completedAt: null,
    ...overrides,
  };
}

function buildMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: 10,
    name: 'Coffee',
    price: 5000,
    category: 'drinks',
    description: null,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidTransition - 단방향 전이 검증', () => {
    it('정방향 전이를 허용한다', () => {
      expect(isValidTransition('pending', 'preparing')).toBe(true);
      expect(isValidTransition('preparing', 'completed')).toBe(true);
      expect(isValidTransition('pending', 'completed')).toBe(true);
    });

    it('역방향 전이를 금지한다', () => {
      expect(isValidTransition('completed', 'preparing')).toBe(false);
      expect(isValidTransition('preparing', 'pending')).toBe(false);
      expect(isValidTransition('completed', 'pending')).toBe(false);
    });

    it('동일 상태 전이를 금지한다', () => {
      expect(isValidTransition('pending', 'pending')).toBe(false);
      expect(isValidTransition('completed', 'completed')).toBe(false);
    });
  });

  describe('createOrder - 금액 서버 계산', () => {
    it('서버에서 금액을 계산하여 주문을 생성하고 SSE 를 발행한다', async () => {
      mockedSessionModel.findById.mockResolvedValue(buildSession());
      mockedMenuModel.findActiveByIds.mockResolvedValue([
        buildMenu({ id: 10, name: 'Coffee', price: 5000 }),
        buildMenu({ id: 11, name: 'Tea', price: 3000 }),
      ]);
      const created = {
        id: 100,
        tableSessionId: 1,
        tableNumber: 'A1',
        status: 'pending',
        totalAmount: 13000,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as OrderWithItems;
      mockedOrderModel.createWithItems.mockResolvedValue(created);

      const result = await OrderService.createOrder({
        tableSessionId: 1,
        menuItems: [
          { menuId: 10, quantity: 2 },
          { menuId: 11, quantity: 1 },
        ],
      });

      // 5000*2 + 3000*1 = 13000
      expect(mockedOrderModel.createWithItems).toHaveBeenCalledWith(
        1,
        'A1',
        13000,
        expect.arrayContaining([
          expect.objectContaining({ menuId: 10, menuName: 'Coffee', unitPrice: 5000, quantity: 2 }),
          expect.objectContaining({ menuId: 11, menuName: 'Tea', unitPrice: 3000, quantity: 1 }),
        ])
      );
      expect(mockedEvents.broadcastOrderCreated).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });

    it('세션이 없으면 SessionNotFoundError 를 던진다', async () => {
      mockedSessionModel.findById.mockResolvedValue(null);

      await expect(
        OrderService.createOrder({ tableSessionId: 99, menuItems: [{ menuId: 10, quantity: 1 }] })
      ).rejects.toBeInstanceOf(SessionNotFoundError);
    });

    it('세션이 비활성이면 SessionInactiveError 를 던진다', async () => {
      mockedSessionModel.findById.mockResolvedValue(buildSession({ isActive: false }));

      await expect(
        OrderService.createOrder({ tableSessionId: 1, menuItems: [{ menuId: 10, quantity: 1 }] })
      ).rejects.toBeInstanceOf(SessionInactiveError);
    });

    it('비활성/없는 메뉴가 포함되면 MenuNotAvailableError 를 던진다', async () => {
      mockedSessionModel.findById.mockResolvedValue(buildSession());
      mockedMenuModel.findActiveByIds.mockResolvedValue([buildMenu({ id: 10 })]);

      await expect(
        OrderService.createOrder({
          tableSessionId: 1,
          menuItems: [
            { menuId: 10, quantity: 1 },
            { menuId: 999, quantity: 1 },
          ],
        })
      ).rejects.toBeInstanceOf(MenuNotAvailableError);
    });
  });

  describe('updateOrderStatus - 상태 전이 검증', () => {
    it('유효한 전이는 상태를 갱신하고 SSE 를 발행한다', async () => {
      const current = { id: 1, status: 'pending' } as Order;
      const updated = { id: 1, status: 'preparing', tableSessionId: 1 } as Order;
      mockedOrderModel.findById.mockResolvedValue(current);
      mockedOrderModel.updateStatus.mockResolvedValue(updated);

      const result = await OrderService.updateOrderStatus(1, 'preparing');

      expect(mockedOrderModel.updateStatus).toHaveBeenCalledWith(1, 'preparing');
      expect(mockedEvents.broadcastOrderStatusChanged).toHaveBeenCalledWith(updated);
      expect(result).toBe(updated);
    });

    it('역방향 전이는 InvalidStatusTransitionError 를 던진다', async () => {
      mockedOrderModel.findById.mockResolvedValue({ id: 1, status: 'completed' } as Order);

      await expect(OrderService.updateOrderStatus(1, 'preparing')).rejects.toBeInstanceOf(
        InvalidStatusTransitionError
      );
      expect(mockedOrderModel.updateStatus).not.toHaveBeenCalled();
    });

    it('주문이 없으면 OrderNotFoundError 를 던진다', async () => {
      mockedOrderModel.findById.mockResolvedValue(null);

      await expect(OrderService.updateOrderStatus(1, 'preparing')).rejects.toBeInstanceOf(
        OrderNotFoundError
      );
    });
  });

  describe('deleteOrder', () => {
    it('주문을 삭제하고 SSE 를 발행한다', async () => {
      mockedOrderModel.findById.mockResolvedValue({
        id: 5,
        tableSessionId: 2,
        status: 'pending',
      } as Order);
      mockedOrderModel.delete.mockResolvedValue(true);

      await OrderService.deleteOrder(5);

      expect(mockedOrderModel.delete).toHaveBeenCalledWith(5);
      expect(mockedEvents.broadcastOrderDeleted).toHaveBeenCalledWith(2, 5);
    });

    it('주문이 없으면 OrderNotFoundError 를 던진다', async () => {
      mockedOrderModel.findById.mockResolvedValue(null);

      await expect(OrderService.deleteOrder(5)).rejects.toBeInstanceOf(OrderNotFoundError);
    });
  });
});
