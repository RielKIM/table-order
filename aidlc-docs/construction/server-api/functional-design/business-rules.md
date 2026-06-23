# 비즈니스 규칙

## 1. 입력 검증 규칙 (Validation Rules - Zod 스키마)

### 인증 (Auth)
| 필드 | 규칙 |
|---|---|
| storeId | 문자열, 1~50자, 필수 |
| username | 문자열, 1~50자, 필수 |
| password | 문자열, 8자 이상, 필수 |

### 메뉴 (Menu)
| 필드 | 규칙 |
|---|---|
| name | 문자열, 1~100자, 필수 |
| price | 정수, > 0, 필수 |
| category | 문자열, 1~50자, 필수 |
| description | 문자열, 0~500자, 선택 |
| imageUrl | URL 형식, 0~255자, 선택 |

### 주문 (Order)
| 필드 | 규칙 |
|---|---|
| tableSessionId | 정수, > 0, 필수 |
| menuItems | 배열, 1개 이상, 필수 |
| menuItems[].menuId | 정수, > 0, 필수 |
| menuItems[].quantity | 정수, 1~99, 필수 |

### 테이블 (Table)
| 필드 | 규칙 |
|---|---|
| storeId | 문자열, 1~50자, 필수 |
| tableNumber | 문자열, 1~10자, 필수 |
| tablePassword | 문자열, 4자 이상, 필수 |

## 2. 비즈니스 제약 규칙

### BR-01: 주문 생성 제약
- 테이블 세션이 활성(isActive=true) 상태여야 함
- 모든 주문 메뉴가 활성(isActive=true) 상태여야 함
- 주문 항목 최소 1개 이상 (Q4: 최소 금액/수량 제약 없음)
- 주문 총액은 자동 계산 (클라이언트 값 신뢰 안 함)

### BR-02: 주문 상태 전이 제약 (Q2: 단방향 + 취소)
- 허용: pending → preparing → completed
- 금지: 역방향 전이 (completed → preparing 등)
- 삭제(취소): 모든 상태에서 가능

### BR-03: 테이블 세션 라이프사이클 (Q3: 주문 트리거)
- 세션 생성 시 activatedAt = null
- 첫 주문 시 activatedAt 기록 (세션 시작 시점)
- 이용 완료 처리 시까지 세션 유지 (Q6 영구 유지 정책)
- 이용 완료 시 주문 → OrderHistory 아카이브, 새 세션 생성

### BR-04: 메뉴 Soft Delete (Q5)
- 메뉴 삭제는 isActive=false로 처리
- 고객 메뉴 조회는 isActive=true만 노출
- 기존 주문 항목은 menuName/unitPrice 스냅샷으로 보존

### BR-05: 주문 내역 필터링
- 고객 주문 내역: 현재 세션(activatedAt 이후, isActive=true)의 주문만
- 이용 완료된 세션의 주문은 과거 이력으로만 조회 가능

## 3. 권한 규칙 (Authorization Rules)

### AR-01: 관리자 전용 엔드포인트
- 인증 미들웨어(JWT 검증) 필수
- 대상: 메뉴 CRUD, 주문 상태 변경, 주문 삭제, 테이블 관리, 대시보드, 관리자 SSE

### AR-02: 고객(테이블) 엔드포인트
- 테이블 세션 토큰 검증
- 대상: 메뉴 조회, 주문 생성, 현재 세션 주문 조회, 고객 SSE

### AR-03: 공개 엔드포인트
- 인증 불필요
- 대상: 관리자 로그인, 테이블 로그인, health check

### AR-04: Object-level 권한 (IDOR 방지)
- 고객은 자신의 테이블 세션 주문만 조회 가능
- 주문 조회 시 tableSessionId 일치 여부 검증

## 4. 보안 규칙 (Security Extension 준수)

### SEC-01: 인증/세션 (SECURITY-12)
- bcrypt 비밀번호 해싱 (salt rounds: 10)
- JWT 서버 사이드 검증 (서명, 만료, 발급자)
- 로그인 5회 실패 → 15분 잠금
- 비밀번호 최소 8자

### SEC-02: 입력 검증 (SECURITY-05)
- 모든 API 입력은 Zod 스키마 검증
- Knex parameterized query (SQL Injection 방지)
- 문자열 최대 길이 제약
- 요청 바디 크기 제한

### SEC-03: 접근 제어 (SECURITY-08)
- Deny by default (모든 라우트 인증 필수, 공개 라우트만 명시)
- Object-level 권한 검증 (IDOR 방지)
- CORS 명시적 origin 허용 (와일드카드 금지)

### SEC-04: HTTP 보안 헤더 (SECURITY-04)
- Content-Security-Policy: default-src 'self'
- Strict-Transport-Security: max-age=31536000
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

### SEC-05: 에러 처리 (SECURITY-15)
- 글로벌 에러 핸들러 (uncaught 예외 처리)
- 프로덕션 에러 응답에 스택 트레이스/내부 정보 노출 금지
- Fail closed (에러 시 접근 거부)
- 모든 외부 호출(DB) try/catch + 트랜잭션 롤백

### SEC-06: 로깅 (SECURITY-03)
- 구조화된 로깅 (timestamp, level, message, requestId)
- 민감 정보(비밀번호, 토큰) 로깅 금지

## 5. 에러 코드 정의

| 코드 | HTTP | 설명 |
|---|---|---|
| AUTH_INVALID_CREDENTIALS | 401 | 잘못된 자격증명 |
| AUTH_ACCOUNT_LOCKED | 423 | 계정 잠금 |
| AUTH_TOKEN_EXPIRED | 401 | 토큰 만료 |
| AUTH_UNAUTHORIZED | 401 | 인증 필요 |
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| MENU_NOT_FOUND | 404 | 메뉴 없음 |
| MENU_NOT_AVAILABLE | 400 | 비활성 메뉴 |
| ORDER_NOT_FOUND | 404 | 주문 없음 |
| ORDER_INVALID_STATUS | 400 | 잘못된 상태 전이 |
| SESSION_NOT_FOUND | 404 | 세션 없음 |
| SESSION_INACTIVE | 400 | 비활성 세션 |
| STORE_NOT_FOUND | 404 | 매장 없음 |
| INTERNAL_ERROR | 500 | 서버 내부 오류 |
