# Functional Design Plan - 테이블오더 비즈니스 로직

## 개요
테이블오더 시스템의 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 설계하는 계획입니다.
비즈니스 로직은 Server API에 집중되어 있으며, 고객/관리자 앱의 프론트엔드 컴포넌트도 포함합니다.

---

## Functional Design Questions

### Question 1
주문 번호 생성 방식은 어떻게 하시겠습니까?

A) DB Auto-increment ID 그대로 사용 (예: 1, 2, 3...)

B) 일자 기반 순번 (예: 20250120-001, 매일 리셋)

C) 테이블 세션 내 순번 (예: 테이블5-1, 테이블5-2)

X) Other (please describe after [Answer]: tag below)

[Answer]: A (기본값 적용 - AI 선택)

---

### Question 2
주문 상태 전이 규칙을 어떻게 하시겠습니까?

A) 단방향 전이만 — 대기중 → 준비중 → 완료 (역방향 불가)

B) 자유 전이 — 관리자가 임의로 상태 변경 가능 (역방향 포함)

C) 단방향 + 취소 — 단방향 전이 + 언제든 취소(삭제) 가능

X) Other (please describe after [Answer]: tag below)

[Answer]: C (기본값 적용 - AI 선택)

---

### Question 3
테이블 세션의 첫 주문 시점 처리를 어떻게 하시겠습니까? (요구사항: 세션은 첫 주문 시작 시점부터)

A) 명시적 세션 — 테이블 설정 시 세션 생성, 첫 주문과 무관하게 활성

B) 주문 트리거 세션 — 첫 주문 생성 시 세션 활성화 타임스탬프 기록

C) 항상 활성 — 이용 완료 처리 전까지 항상 세션 유효

X) Other (please describe after [Answer]: tag below)

[Answer]: B (기본값 적용 - AI 선택)

---

### Question 4
최소 주문 금액 또는 주문 제약이 있습니까?

A) 제약 없음 — 장바구니에 1개 이상이면 주문 가능

B) 최소 금액 — 최소 주문 금액 설정 (금액 명시 필요)

C) 수량 제한 — 메뉴당 최대 수량 제한

X) Other (please describe after [Answer]: tag below)

[Answer]: A (기본값 적용 - AI 선택)

---

### Question 5
메뉴 삭제 시 진행 중인 주문 처리를 어떻게 하시겠습니까?

A) Soft Delete — is_active=false로 비활성화, 기존 주문 데이터 유지

B) Hard Delete 차단 — 진행 중 주문에 사용된 메뉴는 삭제 불가

C) Hard Delete 허용 — 주문 항목은 메뉴명/가격을 스냅샷으로 저장하므로 삭제 가능

X) Other (please describe after [Answer]: tag below)

[Answer]: A (기본값 적용 - AI 선택)

---

### Question 6
관리자 계정 생성 방식은 어떻게 하시겠습니까? (회원가입 기능은 제외 범위)

A) 시드 데이터 — 마이그레이션/시드로 초기 관리자 계정 생성

B) CLI 스크립트 — 관리자 생성 전용 CLI 스크립트 제공

C) 둘 다 — 시드 기본 계정 + CLI 추가 생성

X) Other (please describe after [Answer]: tag below)

[Answer]: A (기본값 적용 - AI 선택)

---

## Design Steps (승인 후 실행)

### Phase 1: Domain Entities
- [x] 도메인 엔티티 정의 (User, Menu, Order, OrderItem, TableSession, OrderHistory)
- [x] 엔티티 간 관계 정의
- [x] 속성 및 타입 정의

### Phase 2: Business Logic Model
- [x] 인증 비즈니스 로직 (로그인, 세션, 잠금)
- [x] 주문 생성 비즈니스 로직
- [x] 주문 상태 관리 로직
- [x] 테이블 세션 라이프사이클 로직
- [x] 메뉴 관리 로직
- [x] SSE 이벤트 발행 로직

### Phase 3: Business Rules
- [x] 검증 규칙 (입력값, 비즈니스 제약)
- [x] 상태 전이 규칙
- [x] 권한 규칙

### Phase 4: Frontend Components
- [x] Customer App 컴포넌트 계층 및 상태
- [x] Admin App 컴포넌트 계층 및 상태
- [x] API 통합 포인트

---

## Mandatory Artifacts
- `aidlc-docs/construction/server-api/functional-design/domain-entities.md`
- `aidlc-docs/construction/server-api/functional-design/business-logic-model.md`
- `aidlc-docs/construction/server-api/functional-design/business-rules.md`
- `aidlc-docs/construction/server-api/functional-design/frontend-components.md`
