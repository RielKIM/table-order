# Application Design Plan - 테이블오더 MVP

## 개요
테이블오더 시스템의 컴포넌트, 인터페이스, 서비스 계층 설계 계획입니다.

---

## Design Questions

### Question 1
데이터베이스 스키마 접근 방식은 어떻게 하시겠습니까?

A) Centralized Models — `server/src/models/`에 모든 모델 정의 (예: User, Menu, Order, TableSession)

B) Domain Models — 도메인별 폴더 구조 (예: `server/src/domain/auth/models.ts`, `server/src/domain/menu/models.ts`)

C) Repository Pattern — 도메인 모델 + 리포지토리 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
API 계층 구조는 어떻게 하시겠습니까?

A) Controller-Service-Repository (전통적 Express 구조)
   - Controllers: HTTP 요청 처리
   - Services: 비즈니스 로직
   - Repositories/Models: 데이터 접근

B) Slim Controller — Controllers가 직접 Service 호출, 비즈니스 로직은 Service 내부

C) Feature-Based — `server/src/features/auth/`, `server/src/features/orders/` (각 feature 내에 controller/service/model)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 3
실시간 통신(SSE) 관리는 어떻게 하시겠습니까?

A) Centralized SSE Service — 모든 SSE 연결을 하나의 서비스에서 관리, 이벤트 브로드캐스트

B) Feature-Based SSE — 각 도메인(orders, tables)별 SSE 엔드포인트

C) Hybrid — SSE 관리 서비스 + 도메인별 이벤트 발행

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
클라이언트 상태 관리(Zustand) 구조는 어떻게 하시겠습니까?

A) Feature Stores — `client/src/shared/store/`에 authStore.ts, menuStore.ts, cartStore.ts, orderStore.ts

B) Single Store — 하나의 큰 스토어에 모든 상태 (slice로 구분)

C) Domain Stores — 고객 앱 스토어, 관리자 앱 스토어 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5
인증/인가 계층 구조는 어떻게 하시겠습니까?

A) Middleware 기반 — JWT 검증 미들웨어 + 역할 검증 미들웨어

B) Decorator/Guard — 컨트롤러 메서드에 데코레이터나 가드 적용

C) Service Layer — 인증 서비스에서 검증 후 호출

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Design Steps (승인 후 실행)

### Phase 1: Component Identification
- [x] 고객 앱 컴포넌트 식별
- [x] 관리자 앱 컴포넌트 식별
- [x] 서버 컴포넌트 식별

### Phase 2: Component Methods & Interfaces
- [x] 각 컴포넌트의 메서드 시그니처 정의
- [x] 입력/출력 타입 정의
- [x] 인터페이스 계약 정의

### Phase 3: Service Layer Design
- [x] 서비스 레이어 정의
- [x] 서비스 간 협력 패턴 정의
- [x] 오케스트레이션 흐름 정의

### Phase 4: Component Dependencies
- [x] 컴포넌트 의존성 매트릭스 생성
- [x] 통신 패턴 정의
- [x] 데이터 흐름 다이어그램

### Phase 5: Database Schema Design
- [x] ERD (Entity Relationship Diagram)
- [x] 테이블 정의
- [x] 인덱스, 제약 조건 정의

---

## Mandatory Artifacts
- `aidlc-docs/inception/application-design/components.md`
- `aidlc-docs/inception/application-design/component-methods.md`
- `aidlc-docs/inception/application-design/services.md`
- `aidlc-docs/inception/application-design/component-dependency.md`
- `aidlc-docs/inception/application-design/application-design.md` (통합 문서)
