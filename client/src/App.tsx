import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerApp from '@/apps/customer/CustomerApp';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

/**
 * 단일 SPA 빌드 - 경로 기반 앱 분기.
 *
 * - '/admin/*' : 관리자 앱 (AdminApp 이 내부 라우팅 보유)
 * - '/*'       : 고객 앱   (CustomerApp 이 내부 라우팅 보유)
 *
 * Deviation: 기존에는 VITE_APP_TYPE 환경변수로 customer/admin 을 별도
 * 번들로 분기했으나, 빠른 배포를 위해 두 앱을 단일 번들(단일 SPA)로
 * 통합한다. 관리자 앱은 lazy import 로 코드 스플리팅하여 '/admin'
 * 진입 시에만 청크를 로드한다.
 */
const AdminApp = lazy(() => import('@/apps/admin/AdminApp'));

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <LoadingSpinner fullScreen label="관리자 앱을 불러오는 중..." />
            }
          >
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<CustomerApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
