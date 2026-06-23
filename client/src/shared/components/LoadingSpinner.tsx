/** 로딩 스피너 (공통) */
interface LoadingSpinnerProps {
  /** 안내 문구 */
  label?: string;
  /** 전체 화면 중앙 정렬 여부 */
  fullScreen?: boolean;
}

function LoadingSpinner({ label = '불러오는 중...', fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div
      data-testid="loading-spinner-container"
      className={
        fullScreen
          ? 'flex flex-col items-center justify-center min-h-screen gap-3'
          : 'flex flex-col items-center justify-center gap-3 py-8'
      }
      role="status"
      aria-live="polite"
    >
      <div
        data-testid="loading-spinner-icon"
        className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
      />
      {label && (
        <span data-testid="loading-spinner-label" className="text-sm text-gray-500">
          {label}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
