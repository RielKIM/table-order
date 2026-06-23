import { useState } from 'react';
import type { Menu } from '@/shared/types';
import { useMenuStore } from '@/shared/store/menuStore';
import { extractErrorMessage } from '../utils/format';

interface MenuFormModalProps {
  /** 수정 대상 메뉴. null이면 신규 등록 모드. */
  menu: Menu | null;
  onClose: () => void;
  /** 등록/수정 성공 후 호출. */
  onSaved: () => void;
}

interface FormState {
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
}

interface FieldErrors {
  name?: string;
  price?: string;
  category?: string;
}

/**
 * 메뉴 등록/수정 폼 모달. (US-A11, US-A12)
 * 검증 규칙: name 필수, price > 0, category 필수.
 */
function MenuFormModal({ menu, onClose, onSaved }: MenuFormModalProps) {
  const isEdit = menu !== null;
  const createMenu = useMenuStore((s) => s.createMenu);
  const updateMenu = useMenuStore((s) => s.updateMenu);

  const [form, setForm] = useState<FormState>({
    name: menu?.name ?? '',
    price: menu ? String(menu.price) : '',
    category: menu?.category ?? '',
    description: menu?.description ?? '',
    imageUrl: menu?.imageUrl ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) {
      next.name = '메뉴명을 입력해주세요.';
    }
    const priceNumber = Number(form.price);
    if (form.price.trim() === '' || Number.isNaN(priceNumber)) {
      next.price = '가격을 입력해주세요.';
    } else if (priceNumber <= 0) {
      next.price = '가격은 0보다 커야 합니다.';
    }
    if (!form.category.trim()) {
      next.category = '카테고리를 입력해주세요.';
    }
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    setSubmitting(true);
    try {
      if (isEdit && menu) {
        await updateMenu(menu.id, payload);
      } else {
        await createMenu(payload);
      }
      onSaved();
    } catch (err) {
      setSubmitError(extractErrorMessage(err, '메뉴 저장에 실패했습니다.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="menu-form-modal-overlay"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900" data-testid="menu-form-modal-title">
          {isEdit ? '메뉴 수정' : '메뉴 등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="menu-form">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="menu-name">
              메뉴명 <span className="text-red-500">*</span>
            </label>
            <input
              id="menu-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="menu-form-input-name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500" data-testid="menu-form-error-name">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="menu-price">
              가격 <span className="text-red-500">*</span>
            </label>
            <input
              id="menu-price"
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="menu-form-input-price"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500" data-testid="menu-form-error-price">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="menu-category">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <input
              id="menu-category"
              type="text"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="menu-form-input-category"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-500" data-testid="menu-form-error-category">
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="menu-description">
              설명
            </label>
            <textarea
              id="menu-description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="menu-form-input-description"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="menu-image-url">
              이미지 URL
            </label>
            <input
              id="menu-image-url"
              type="text"
              value={form.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              data-testid="menu-form-input-image-url"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-500" data-testid="menu-form-submit-error">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              data-testid="menu-form-cancel-button"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              data-testid="menu-form-submit-button"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuFormModal;
