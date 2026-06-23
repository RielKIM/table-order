import type { Response } from 'express';
import type { Order, OrderWithItems, SSEEvent, SSEEventType } from '../../types';
import { logger } from '../../shared/logger';

const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30초 하트비트

interface SSEClient {
  id: string;
  res: Response;
  isAdmin: boolean;
  // 고객 클라이언트는 자신의 테이블 세션 이벤트만 수신
  tableSessionId?: number;
}

// 중앙 집중식 SSE 이벤트 서비스 (싱글톤)
// - 관리자: 모든 이벤트 수신
// - 고객: 자신의 tableSessionId 관련 이벤트만 수신
class EventService {
  private clients = new Map<string, SSEClient>();
  private heartbeat: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  // 클라이언트 등록 (SSE 헤더 설정은 controller 에서 수행)
  registerClient(
    clientId: string,
    res: Response,
    isAdmin: boolean,
    tableSessionId?: number
  ): void {
    this.clients.set(clientId, { id: clientId, res, isAdmin, tableSessionId });
    logger.info('SSE client registered', {
      clientId,
      isAdmin,
      tableSessionId,
      total: this.clients.size,
    });
    // 연결 직후 초기 코멘트 전송 (프록시 버퍼링 방지)
    res.write(': connected\n\n');
  }

  // 클라이언트 제거
  removeClient(clientId: string): void {
    if (this.clients.delete(clientId)) {
      logger.info('SSE client removed', { clientId, total: this.clients.size });
    }
  }

  // 현재 연결된 클라이언트 수
  get clientCount(): number {
    return this.clients.size;
  }

  // 주문 생성 이벤트 (관리자 전체 + 해당 테이블 고객)
  broadcastOrderCreated(order: OrderWithItems): void {
    this.broadcast(
      {
        type: 'order_created',
        data: {
          orderId: order.id,
          tableSessionId: order.tableSessionId,
          tableNumber: order.tableNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          items: order.items,
        },
      },
      order.tableSessionId
    );
  }

  // 주문 상태 변경 이벤트 (관리자 전체 + 해당 테이블 고객)
  broadcastOrderStatusChanged(order: Order): void {
    this.broadcast(
      {
        type: 'order_status_changed',
        data: {
          orderId: order.id,
          tableSessionId: order.tableSessionId,
          tableNumber: order.tableNumber,
          status: order.status,
        },
      },
      order.tableSessionId
    );
  }

  // 주문 삭제 이벤트 (관리자 전체 + 해당 테이블 고객)
  broadcastOrderDeleted(tableSessionId: number, orderId: number): void {
    this.broadcast(
      {
        type: 'order_deleted',
        data: { orderId, tableSessionId },
      },
      tableSessionId
    );
  }

  // 테이블 이용 완료 이벤트 (관리자 전체)
  broadcastTableSessionCompleted(tableSessionId: number, tableNumber: string): void {
    this.broadcast(
      {
        type: 'table_session_completed',
        data: { tableSessionId, tableNumber },
      },
      tableSessionId,
      true // 관리자 전용
    );
  }

  // 내부 브로드캐스트: 관리자 전체 + 대상 테이블 고객(adminOnly=false 일 때)
  private broadcast(event: SSEEvent, tableSessionId?: number, adminOnly = false): void {
    const payload = this.format(event);
    for (const client of this.clients.values()) {
      if (client.isAdmin) {
        this.write(client, payload, event.type);
        continue;
      }
      if (adminOnly) {
        continue;
      }
      // 고객: 자신의 tableSessionId 이벤트만 수신
      if (tableSessionId !== undefined && client.tableSessionId === tableSessionId) {
        this.write(client, payload, event.type);
      }
    }
  }

  private write(client: SSEClient, payload: string, eventType: SSEEventType): void {
    try {
      client.res.write(payload);
    } catch (err) {
      logger.error('SSE write failed', {
        clientId: client.id,
        eventType,
        message: (err as Error).message,
      });
      this.removeClient(client.id);
    }
  }

  // SSE data 포맷: `data: {JSON}\n\n`
  private format(event: SSEEvent): string {
    return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  }

  private startHeartbeat(): void {
    if (this.heartbeat) {
      return;
    }
    this.heartbeat = setInterval(() => {
      for (const client of this.clients.values()) {
        try {
          client.res.write(': heartbeat\n\n');
        } catch {
          this.removeClient(client.id);
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
    // 하트비트 타이머가 프로세스 종료를 막지 않도록 unref
    this.heartbeat.unref?.();
  }
}

// 싱글톤 인스턴스 export
export const eventService = new EventService();
