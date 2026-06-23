import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface OrderConfirmationLocationState {
  orderId?: number;
}

const REDIRECT_SECONDS = 5;

/** 주문 확인 화면 (US-C09) — 주문번호 표시 + 5초 카운트다운 후 메뉴로 */
function OrderConfirmationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderConfirmationLocationState | null;
  const orderId = state?.orderId;

  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // orderId 없이 직접 접근 시 메뉴로 (잘못된 진입 방지)
  useEffect(() => {
    if (orderId == null) {
      navigate('/menu', { replace: true });
    }
  }, [orderId, navigate]);

  // 1초마다 카운트다운
  useEffect(() => {
    if (orderId == null) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  // 카운트다운 종료 시 메뉴 화면으로 리다이렉트
  useEffect(() => {
    if (countdown === 0) {
      navigate('/menu', { replace: true });
    }
  }, [countdown, navigate]);

  if (orderId == null) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div
        data-testid="order-confirmation-panel"
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="text-xl font-bold text-gray-900">주문이 완료되었습니다</h1>
        <p className="mt-2 text-sm text-gray-500">주문 번호</p>
        <p data-testid="order-confirmation-order-id" className="mt-1 text-3xl font-bold text-blue-600">
          #{orderId}
        </p>

        <p data-testid="order-confirmation-countdown" className="mt-6 text-sm text-gray-500">
          {countdown}초 후 메뉴 화면으로 이동합니다.
        </p>

        <button
          type="button"
          data-testid="order-confirmation-now-button"
          className="mt-4 min-h-[44px] w-full rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => navigate('/menu', { replace: true })}
        >
          메뉴로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmationScreen;
