# Code Generation Plan - 테이블오더 MVP

## 개요
3개 Unit(Server API, Customer App, Admin App)의 코드를 생성하는 계획입니다.
모노레포 구조이며 기존 스캐폴딩을 활용/수정합니다.

## 코드 위치
- **Server**: `server/src/` (Feature-Based 구조)
- **Client**: `client/src/` (apps/customer, apps/admin, shared)
- **Database**: `database/migrations/`
- **Docs**: `aidlc-docs/construction/*/code/` (마크다운 요약만)

---

## Unit 1: Server API

### Step 1: 프로젝트 기반 설정
- [ ] Docker Compose 파일 (postgres + server)
- [ ] 환경 변수 설정 (.env.example 업데이트)
- [ ] Knex 설정 파일 (knexfile.ts)
- [ ] TypeScript 타입 정의 (shared types)

### Step 2: 데이터베이스 마이그레이션
- [ ] users 테이블 마이그레이션
- [ ] menus 테이블 마이그레이션
- [ ] table_sessions 테이블 마이그레이션
- [ ] orders 테이블 마이그레이션
- [ ] order_items 테이블 마이그레이션
- [ ] order_history 테이블 마이그레이션
- [ ] 시드 데이터 (관리자 계정 + 샘플 메뉴)

### Step 3: 공유 유틸리티 (Shared)
- [ ] ResponseHelper (통일 응답 포맷)
- [ ] ErrorHandler (글로벌 에러 핸들러)
- [ ] Logger (구조화 로깅)
- [ ] 커스텀 에러 클래스
- [ ] Security 미들웨어 (헤더, CORS)

### Step 4: 데이터 모델 (Models)
- [ ] User Model
- [ ] Menu Model
- [ ] TableSession Model
- [ ] Order Model
- [ ] OrderItem Model
- [ ] OrderHistory Model

### Step 5: Auth Feature
- [ ] AuthService (로그인, JWT, 잠금)
- [ ] AuthController
- [ ] AuthMiddleware (JWT 검증)
- [ ] Zod 검증 스키마
- [ ] 단위 테스트

### Step 6: Menu Feature
- [ ] MenuService (CRUD)
- [ ] MenuController
- [ ] Zod 검증 스키마
- [ ] 단위 테스트

### Step 7: Table Feature
- [ ] TableService (세션 관리)
- [ ] TableController
- [ ] Zod 검증 스키마
- [ ] 단위 테스트

### Step 8: Order Feature
- [ ] OrderService (생성, 상태, 삭제)
- [ ] OrderController
- [ ] Zod 검증 스키마
- [ ] 단위 테스트

### Step 9: Event Feature (SSE)
- [ ] EventService (연결 관리, 브로드캐스트)
- [ ] SSEController
- [ ] 단위 테스트

### Step 10: 라우트 통합
- [ ] 모든 라우트 app.ts에 등록
- [ ] 미들웨어 체인 구성
- [ ] Server API 코드 요약 문서

---

## Unit 2: Customer App

### Step 11: 클라이언트 공유 기반
- [ ] API 서비스 (axios 인스턴스)
- [ ] SSE 서비스
- [ ] 공통 타입 정의
- [ ] 공통 컴포넌트 (MenuCard, CartItem 등)
- [ ] Tailwind 설정 확인

### Step 12: Customer Stores (Zustand)
- [ ] authStore (테이블 세션)
- [ ] menuStore
- [ ] cartStore (localStorage 연동)
- [ ] orderStore

### Step 13: Customer Pages
- [ ] TableAuthScreen
- [ ] MenuScreen + CategoryTabs + MenuGrid
- [ ] CartScreen
- [ ] OrderConfirmationScreen (5초 리다이렉트)
- [ ] OrderHistoryScreen (SSE)
- [ ] 라우팅 설정
- [ ] Customer App 코드 요약 문서

---

## Unit 3: Admin App

### Step 14: Admin Stores (Zustand)
- [ ] authStore (JWT)
- [ ] dashboardStore
- [ ] orderStore
- [ ] menuStore

### Step 15: Admin Pages
- [ ] LoginScreen
- [ ] DashboardScreen + TableCard (SSE 강조)
- [ ] TableDetailModal (상태 변경, 삭제, 이용완료)
- [ ] OrderHistoryModal (날짜 필터)
- [ ] MenuManagementScreen (CRUD)
- [ ] 라우팅 설정
- [ ] Admin App 코드 요약 문서

### Step 16: 통합 및 마무리
- [ ] Docker Compose 전체 구성 (4개 컨테이너)
- [ ] README 업데이트 (실행 방법)
- [ ] 전체 코드 요약 문서

---

## Story Traceability
- Server API: 모든 25개 스토리의 백엔드
- Customer App: US-C01~C11
- Admin App: US-A01~A14

## 총 단계: 16 Steps
