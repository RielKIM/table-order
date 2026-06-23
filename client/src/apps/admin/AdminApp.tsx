import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { buildEventsUrl, connectSSE } from '@/shared/services/sse';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import MenuManagementScreen from './pages/MenuManagementScreen';

/** 관리자용 SSE 엔드포인트 경로 (API_BASE_URL 기준 상대 경로) */
const ADMIN_SSE_PATH = '/events/admin/orders';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * 인증 후 공통 레이아웃: 좌측 Sidebar + 우측 라우트 콘텐츠.
 */
function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50" data-testid="admin-layout-container">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" data-testid="admin-layout-main">
        {children}
      </main>
    </div>
  );
}

/**
 * 관리자 앱 루트.
 * - 마운트 시 authStore.validateToken 으로 세션 복원 (US-A02)
 * - 미인증: LoginScreen / 인증: AdminLayout + 라우트
 * - 인증 상태에서 관리자용 SSE(buildEventsUrl(ADMIN_SSE_PATH)) 연결 (US-A04)
 */
function AdminApp() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const validateToken = useAuthStore((s) => s.validateToken);
  const applySSEUpdate = useOrderStore((s) => s.applySSEUpdate);

  const [restoring, setRestoring] = useState(true);

  // 세션 복원: 저장된 토큰 검증.
  useEffect(() => {
    let active = true;
    Promise.resolve(validateToken())
      .catch(() => {
        // 토큰이 없거나 만료된 경우 미인증 상태로 유지.
      })
      .finally(() => {
        if (active) {
          setRestoring(false);
        }
      });
    return () => {
      active = false;
    };
  }, [validateToken]);

  // 관리자 SSE 연결: 인증된 경우에만.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const connection = connectSSE(buildEventsUrl(ADMIN_SSE_PATH), (event) => {
      applySSEUpdate(event);
    });
    return () => {
      connection.disconnect();
    };
  }, [isAuthenticated, applySSEUpdate]);

  if (restoring) {
    return (
      <div className="flex h-screen items-center justify-center" data-testid="admin-app-restoring">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="menus" element={<MenuManagementScreen />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default AdminApp;
