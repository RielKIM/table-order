import { useEffect, useRef, useState } from 'react';
import type { TableDashboardItem } from '@/shared/types';
import { useOrderStore } from '@/shared/store/orderStore';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import TableCard from '../components/TableCard';
import TableDetailModal from '../components/TableDetailModal';
import { extractErrorMessage } from '../utils/format';

const HIGHLIGHT_DURATION_MS = 5000;

/**
 * 관리자 대시보드. (US-A03, US-A04, US-A05)
 * 테이블별 카드 그리드를 표시하고, SSE로 갱신된 dashboardItems 변화를 감지해
 * 신규 주문이 들어온 테이블 카드를 강조한다. 카드 클릭 시 상세 모달을 연다.
 *
 * SSE 연결 자체는 AdminApp 에서 관리하며 orderStore.applySSEUpdate 로 dashboardItems 를
 * 갱신한다. 이 화면은 dashboardItems 의 변화를 구독해 강조 효과를 파생시킨다.
 */
function DashboardScreen() {
  const dashboardItems = useOrderStore((s) => s.dashboardItems);
  const fetchDashboard = useOrderStore((s) => s.fetchDashboard);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableDashboardItem | null>(null);
  const [newTableIds, setNewTableIds] = useState<Set<number>>(new Set());

  // 테이블별 최신 주문 ID 스냅샷. 신규 주문 감지에 사용.
  const latestOrderIdRef = useRef<Map<number, number>>(new Map());
  const initializedRef = useRef(false);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDashboard()
      .catch((err: unknown) => {
        setError(extractErrorMessage(err, '대시보드를 불러오지 못했습니다.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchDashboard]);

  // 모든 타이머 정리 (언마운트 시).
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // dashboardItems 변화 감지 → 신규 주문 강조.
  useEffect(() => {
    const previous = latestOrderIdRef.current;
    const detectedNew: number[] = [];

    dashboardItems.forEach((item) => {
      const latestId = item.latestOrder?.id ?? 0;
      const prevId = previous.get(item.tableSessionId) ?? 0;
      if (initializedRef.current && latestId > prevId) {
        detectedNew.push(item.tableSessionId);
      }
      previous.set(item.tableSessionId, latestId);
    });

    if (!initializedRef.current) {
      // 최초 로드 시점에는 강조하지 않고 기준선만 기록.
      initializedRef.current = true;
      return;
    }

    if (detectedNew.length === 0) {
      return;
    }

    setNewTableIds((prev) => {
      const next = new Set(prev);
      detectedNew.forEach((id) => next.add(id));
      return next;
    });

    detectedNew.forEach((id) => {
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      const timer = setTimeout(() => {
        setNewTableIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        timersRef.current.delete(id);
      }, HIGHLIGHT_DURATION_MS);
      timersRef.current.set(id, timer);
    });
  }, [dashboardItems]);

  return (
    <div className="p-6" data-testid="dashboard-screen-container">
      <h1 className="mb-6 text-2xl font-bold text-gray-900" data-testid="dashboard-title">
        테이블 대시보드
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-sm text-red-500" data-testid="dashboard-error">
          {error}
        </p>
      ) : dashboardItems.length === 0 ? (
        <p className="text-sm text-gray-500" data-testid="dashboard-empty">
          표시할 테이블이 없습니다.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="dashboard-grid"
        >
          {dashboardItems.map((item) => (
            <TableCard
              key={item.tableSessionId}
              item={item}
              isNew={newTableIds.has(item.tableSessionId)}
              onClick={() => setSelectedTable(item)}
            />
          ))}
        </div>
      )}

      {selectedTable && (
        <TableDetailModal
          tableSessionId={selectedTable.tableSessionId}
          tableNumber={selectedTable.tableNumber}
          onClose={() => setSelectedTable(null)}
          onChanged={() => {
            void fetchDashboard();
          }}
        />
      )}
    </div>
  );
}

export default DashboardScreen;
