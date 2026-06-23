// 커스텀 에러 클래스 정의

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message = '입력값이 올바르지 않습니다') {
    super('VALIDATION_ERROR', 400, message);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = '아이디 또는 비밀번호가 올바르지 않습니다') {
    super('AUTH_INVALID_CREDENTIALS', 401, message);
  }
}

export class AccountLockedError extends AppError {
  constructor(remainingMinutes: number) {
    super(
      'AUTH_ACCOUNT_LOCKED',
      423,
      `계정이 잠겼습니다. ${remainingMinutes}분 후 다시 시도해주세요`
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다') {
    super('AUTH_UNAUTHORIZED', 401, message);
  }
}

export class MenuNotFoundError extends AppError {
  constructor(message = '메뉴를 찾을 수 없습니다') {
    super('MENU_NOT_FOUND', 404, message);
  }
}

export class MenuNotAvailableError extends AppError {
  constructor(message = '주문할 수 없는 메뉴가 포함되어 있습니다') {
    super('MENU_NOT_AVAILABLE', 400, message);
  }
}

export class OrderNotFoundError extends AppError {
  constructor(message = '주문을 찾을 수 없습니다') {
    super('ORDER_NOT_FOUND', 404, message);
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(message = '잘못된 주문 상태 전이입니다') {
    super('ORDER_INVALID_STATUS', 400, message);
  }
}

export class SessionNotFoundError extends AppError {
  constructor(message = '테이블 세션을 찾을 수 없습니다') {
    super('SESSION_NOT_FOUND', 404, message);
  }
}

export class SessionInactiveError extends AppError {
  constructor(message = '비활성화된 테이블 세션입니다') {
    super('SESSION_INACTIVE', 400, message);
  }
}

export class StoreNotFoundError extends AppError {
  constructor(message = '매장을 찾을 수 없습니다') {
    super('STORE_NOT_FOUND', 404, message);
  }
}
