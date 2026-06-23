import { v4 as uuidv4 } from 'uuid';
import type { Knex } from 'knex';
import db from '../../config/database';
import { UserModel } from '../../models/userModel';
import { TableSessionModel } from '../../models/tableSessionModel';
import { OrderModel } from '../../models/orderModel';
import { eventService } from '../events/eventService';
import type { TableDashboardItem, TableSession } from '../../types';
import { StoreNotFoundError, SessionNotFoundError } from '../../shared/errors';

const SESSION_TTL_MS = 16 * 60 * 60 * 1000; // 16시간
const DASHBOARD_RECENT_LIMIT = 5;

interface SetupResult {
  sessionToken: string;
  expiresAt: Date;
  tableSession: TableSession;
}

interface ValidateResult {
  valid: boolean;
  tableSession: TableSession | null;
}

interface CompleteResult {
  completedSessionId: number;
  newSessionToken: string;
  newSessionId: number;
  expiresAt: Date;
  archivedOrders: number;
}

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

export const TableService = {
  // 테이블 초기 설정: 매장 존재 확인 → UUID sessionToken → 16시간 만료 세션 생성
  async setupTable(
    storeId: string,
    tableNumber: string,
    _tablePassword: string
  ): Promise<SetupResult> {
    const store = await UserModel.findByStoreId(storeId);
    if (!store) {
      throw new StoreNotFoundError();
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const tableSession = await TableSessionModel.create({
      storeId,
      tableNumber,
      sessionToken,
      expiresAt,
    });

    return { sessionToken, expiresAt, tableSession };
  },

  // 자동 로그인: sessionToken 검증, 만료 시 갱신
  async validateTableLogin(sessionToken: string): Promise<ValidateResult> {
    const session = await TableSessionModel.findByToken(sessionToken);
    if (!session || !session.isActive) {
      return { valid: false, tableSession: null };
    }

    // 만료 확인: 만료 시 재설정 필요
    if (session.expiresAt.getTime() < Date.now()) {
      return { valid: false, tableSession: null };
    }

    return { valid: true, tableSession: session };
  },

  // 테이블 이용 완료: 주문 → OrderHistory 아카이브, 세션 complete, 새 세션 생성 (트랜잭션)
  async completeTableSession(sessionId: number): Promise<CompleteResult> {
    const session = await TableSessionModel.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundError();
    }

    const orders = await OrderModel.findByTableSession(sessionId);
    const completedAt = new Date();
    const newToken = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const newSessionId = await db.transaction(async (trx: Knex.Transaction) => {
      // a. 각 주문을 OrderHistory 로 아카이브 (itemsSnapshot 포함)
      for (const order of orders) {
        await trx('order_history').insert({
          order_id: order.id,
          table_session_id: session.id,
          table_number: order.tableNumber,
          status: order.status,
          total_amount: order.totalAmount,
          items_snapshot: JSON.stringify(order.items),
          created_at: order.createdAt,
          completed_at: completedAt,
        });
      }

      // b. 원본 주문 삭제 (order_items 는 ON DELETE CASCADE)
      await trx('orders').where({ table_session_id: session.id }).del();

      // c. 세션 완료 처리
      await trx('table_sessions')
        .where({ id: session.id })
        .update({ is_active: false, completed_at: completedAt });

      // d. 다음 고객용 새 세션 생성 (activated_at=null)
      const [row] = await trx<TableSessionRow>('table_sessions')
        .insert({
          store_id: session.storeId,
          table_number: session.tableNumber,
          session_token: newToken,
          expires_at: expiresAt,
          is_active: true,
          activated_at: null,
        })
        .returning('id');

      return row.id;
    });

    // SSE 발행 (관리자 전체)
    eventService.broadcastTableSessionCompleted(session.id, session.tableNumber);

    return {
      completedSessionId: session.id,
      newSessionToken: newToken,
      newSessionId,
      expiresAt,
      archivedOrders: orders.length,
    };
  },

  // 대시보드 집계: 활성 세션별 주문/금액 요약
  async getDashboardData(): Promise<TableDashboardItem[]> {
    const sessions = await TableSessionModel.findActive();
    const result: TableDashboardItem[] = [];

    for (const session of sessions) {
      const orders = await OrderModel.findByTableSession(session.id);
      const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const recentOrders = [...orders]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, DASHBOARD_RECENT_LIMIT);

      result.push({
        tableSessionId: session.id,
        tableNumber: session.tableNumber,
        totalAmount,
        orderCount: orders.length,
        recentOrders,
      });
    }

    return result;
  },
};
