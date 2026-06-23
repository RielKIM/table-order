import { useState, type FormEvent } from 'react';
import { useTableSessionStore } from '@/shared/store/tableSessionStore';

/** 테이블 초기 설정 화면 (US-C01) */
function TableAuthScreen() {
  const setupTable = useTableSessionStore((s) => s.setupTable);
  const loading = useTableSessionStore((s) => s.loading);
  const serverError = useTableSessionStore((s) => s.error);

  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tablePassword, setTablePassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    // 필수 필드 검증 (US-C01 Scenario 2)
    if (!storeId.trim() || !tableNumber.trim() || !tablePassword.trim()) {
      setFieldError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await setupTable({
        storeId: storeId.trim(),
        tableNumber: tableNumber.trim(),
        tablePassword,
      });
      // 성공 시 App 라우팅이 메뉴 화면으로 전환 (isConfigured 변경)
    } catch {
      // 서버 에러는 store.error 로 표시
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        data-testid="table-auth-form"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-xl font-bold text-gray-900">테이블 초기 설정</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          매장 정보를 입력하여 테이블을 설정하세요.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="storeId" className="mb-1 block text-sm font-medium text-gray-700">
              매장 ID
            </label>
            <input
              id="storeId"
              type="text"
              data-testid="table-auth-store-id"
              className="min-h-[44px] w-full rounded-md border border-gray-300 px-3 text-base focus:border-blue-500 focus:outline-none"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="tableNumber" className="mb-1 block text-sm font-medium text-gray-700">
              테이블 번호
            </label>
            <input
              id="tableNumber"
              type="text"
              data-testid="table-auth-table-number"
              className="min-h-[44px] w-full rounded-md border border-gray-300 px-3 text-base focus:border-blue-500 focus:outline-none"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="tablePassword" className="mb-1 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="tablePassword"
              type="password"
              data-testid="table-auth-password"
              className="min-h-[44px] w-full rounded-md border border-gray-300 px-3 text-base focus:border-blue-500 focus:outline-none"
              value={tablePassword}
              onChange={(e) => setTablePassword(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {(fieldError || serverError) && (
          <p data-testid="table-auth-error" className="mt-4 text-sm text-red-600">
            {fieldError ?? serverError}
          </p>
        )}

        <button
          type="submit"
          data-testid="table-auth-submit"
          className="mt-6 min-h-[44px] w-full rounded-md bg-blue-600 px-4 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? '설정 중...' : '설정 저장'}
        </button>
      </form>
    </div>
  );
}

export default TableAuthScreen;
