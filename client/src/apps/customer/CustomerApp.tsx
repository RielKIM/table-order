import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTableSessionStore } from '@/shared/store/tableSessionStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { buildEventsUrl, connectSSE } from '@/shared/services/sse';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import TableAuthScreen from '@/apps/customer/pages/TableAuthScreen';
import MenuScreen from '@/apps/customer/pages/MenuScreen';
import CartScreen from '@/apps/customer/pages/CartScreen';
import OrderConfirmationScreen from '@/apps/customer/pages/OrderConfirmationScreen';
import OrderHistoryScreen from '@/apps/customer/pages/OrderHistoryScreen';

/**
 * 고객 앱 내부 라우팅.
 * 최상위 BrowserRouter 의 '/*' 하위(루트)에 마운트되는 descendant routes 이므로
 * 경로는 leading slash 없는 상대 경로로 정의한다. (절대 경로는 v6 에서 중첩 시 오류)
 */
function CustomerRoutes() {
  return (
    <Routes>
      <Route path="menu" element={<MenuScreen />} />
      <Route path="cart" element={<CartScreen />} />
      <Route path="order-confirmation" element={<OrderConfirmationScreen />} />
      <Route path="order-history" element={<OrderHistoryScreen />} />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
}

function CustomerApp() {
  const isConfigured = useTableSessionStore((s) => s.isConfigured);
  const tableSession = useTableSessionStore((s) => s.tableSession);
  const sessionToken = useTableSessionStore((s) => s.sessionToken);
  const autoLogin = useTableSessionStore((s) => s.autoLogin);

  const applySSEUpdate = useOrderStore((s) => s.applySSEUpdate);

  const [bootstrapping, setBootstrapping] = useState(true);

  // 부트스트랩: 설정되어 있으면 자동 로그인 (US-C02)
  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (isConfigured) {
        await autoLogin();
      }
      if (active) setBootstrapping(false);
    };
    void bootstrap();
    return () => {
      active = false;
    };
    // 최초 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE 연결: 세션이 활성화되면 주문 이벤트 구독 (US-C11)
  useEffect(() => {
    if (!tableSession) return;

    const session = sessionToken ?? String(tableSession.id);
    const url = buildEventsUrl(
      `/events/orders?session=${encodeURIComponent(session)}`,
    );

    const connection = connectSSE(url, (event) => {
      applySSEUpdate(event);
    });

    return () => {
      connection.disconnect();
    };
  }, [tableSession, sessionToken, applySSEUpdate]);

  if (bootstrapping) {
    return <LoadingSpinner fullScreen label="테이블 정보를 확인하는 중..." />;
  }

  // 미설정 시 초기 설정 화면 (US-C01)
  if (!isConfigured) {
    return <TableAuthScreen />;
  }

  // 내부 라우팅 (최상위 BrowserRouter 컨텍스트 사용)
  return <CustomerRoutes />;
}

export default CustomerApp;
