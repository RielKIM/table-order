import { useState } from 'react';
import { useAuthStore } from '@/shared/store/authStore';
import { extractErrorMessage } from '../utils/format';

/**
 * 관리자 로그인 화면. (US-A01)
 * 매장ID, 사용자명, 비밀번호 입력 후 authStore.login 호출.
 * 인증 실패 및 계정 잠금 메시지를 표시한다.
 */
function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid = storeId.trim() !== '' && username.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ storeId: storeId.trim(), username: username.trim(), password });
      // 성공 시 authStore.isAuthenticated 가 true 가 되어 AdminApp 라우팅이 전환된다.
    } catch (err) {
      setError(extractErrorMessage(err, '아이디 또는 비밀번호가 올바르지 않습니다.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
      data-testid="login-screen-container"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900" data-testid="login-title">
          관리자 로그인
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="login-store-id">
              매장 ID
            </label>
            <input
              id="login-store-id"
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              autoComplete="organization"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="login-input-store-id"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="login-username">
              사용자명
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="login-input-username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="login-password">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="login-input-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" data-testid="login-error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            data-testid="login-submit-button"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
