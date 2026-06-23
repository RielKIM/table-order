import type { OrderStatus } from '@/shared/types';

/**
 * 주문 상태는 단방향으로만 전이된다: pending -> preparing -> completed
 * 역방향 전이는 허용되지 않는다 (관련 버튼은 비활성화).
 */
export const STATUS_ORDER: OrderStatus[] = ['pending', 'preparing', 'completed'];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '대기중',
  preparing: '준비중',
  completed: '완료',
};

/**
 * 현재 상태에서 전이 가능한 다음 상태를 반환한다.
 * 완료 상태이면 더 이상 전이할 수 없으므로 null.
 */
export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) {
    return null;
  }
  return STATUS_ORDER[idx + 1];
}

/**
 * target 상태로 전이가 가능한지 판단한다.
 * 오직 "현재 상태의 바로 다음 단계"로만 전이 가능하다 (단방향).
 */
export function canTransitionTo(current: OrderStatus, target: OrderStatus): boolean {
  return getNextStatus(current) === target;
}
