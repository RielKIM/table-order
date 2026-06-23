/** 확인 팝업 (공통) — 삭제/이용완료 등 확인이 필요한 동작에 사용 */
interface ConfirmDialogProps {
  /** 표시 여부. 생략 시 true (조건부 마운트로 제어하는 경우). */
  open?: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 위험 동작(삭제 등) 강조 */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open = true,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      data-testid="confirm-dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        data-testid="confirm-dialog-panel"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          data-testid="confirm-dialog-title"
          className="text-lg font-bold text-gray-900"
        >
          {title}
        </h2>
        {message && (
          <p data-testid="confirm-dialog-message" className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            data-testid="confirm-dialog-cancel"
            className="min-h-[44px] min-w-[44px] rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-testid="confirm-dialog-confirm"
            className={
              destructive
                ? 'min-h-[44px] min-w-[44px] rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700'
                : 'min-h-[44px] min-w-[44px] rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
