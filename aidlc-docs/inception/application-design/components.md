# 컴포넌트 정의

## 프론트엔드 컴포넌트

### 고객 앱 (Customer App)
- **App**: 앱 최상위 컴포넌트, 라우팅 및 공통 레이아웃
- **TableAuthScreen**: 테이블 초기 설정 화면 (관리자 1회 설정)
- **MenuScreen**: 메뉴 조회 및 탐색 화면
- **CartScreen**: 장바구니 관리 화면
- **OrderConfirmationScreen**: 주문 확정 화면
- **OrderHistoryScreen**: 주문 내역 조회 화면
- **SSEListener**: SSE 실시간 연결 관리 컴포넌트
- **LocalCartProvider**: 로컬 장바구니 저장/로드 컴포넌트

### 관리자 앱 (Admin App)
- **App**: 앱 최상위 컴포넌트, 라우팅 및 사이드바
- **LoginScreen**: 관리자 로그인 화면
- **DashboardScreen**: 실시간 주문 모니터링 대시보드
- **TableDetailScreen**: 테이블 상세 주문 내역 화면
- **MenuManagementScreen**: 메뉴 관리 화면 (CRUD)
- **TableSessionScreen**: 테이블 세션 관리 화면
- **AdminSSEListener**: 관리자용 SSE 연결 관리 컴포넌트

### 공통 공유 컴포넌트
- **MenuCard**: 메뉴 카드 컴포넌트 (고객/관리자 공통)
- **CartItem**: 장바구니 항목 컴포넌트
- **OrderCard**: 주문 카드 컴포넌트 (대시보드)
- **TableCard**: 테이블 카드 컴포넌트 (대시보드)

---

## 서버 컴포넌트

### Feature 기반 디렉토리 구조 (Q2: Feature-Based)
- `server/src/features/auth/` — 인증 관련 컴포넌트
- `server/src/features/menus/` — 메뉴 관리 관련 컴포넌트
- `server/src/features/orders/` — 주문 관련 컴포넌트
- `server/src/features/tables/` — 테이블 세션 관리 컴포넌트
- `server/src/features/events/` — SSE 실시간 이벤트 컴포넌트

### Auth Feature
- **AuthController**: 인증 관련 HTTP 요청 처리
- **AuthService**: JWT 생성/검증, 비밀번호 해싱, 로그인 제한 로직
- **AuthMiddleware**: JWT 검증 및 역할 기반 접근 제어 미들웨어

### Menu Feature
- **MenuController**: 메뉴 CRUD HTTP 요청 처리
- **MenuService**: 메뉴 비즈니스 로직, 카테고리 관리
- **MenuModel**: 메뉴 데이터 모델 및 Knex 쿼리

### Order Feature
- **OrderController**: 주문 생성/조회 HTTP 요청 처리
- **OrderService**: 주문 비즈니스 로직, 상태 관리, SSE 이벤트 발행
- **OrderModel**: 주문 데이터 모델 및 Knex 쿼리
- **OrderHistoryModel**: 과거 주문 내역 데이터 모델

### Table Feature
- **TableController**: 테이블 설정/관리 HTTP 요청 처리
- **TableService**: 테이블 세션 관리, 자동 로그인 처리, 이용 완료 처리
- **TableModel**: 테이블 세션 데이터 모델

### Event Feature
- **SSEController**: SSE 연결 엔드포인트 제공
- **EventService**: SSE 연결 관리, 이벤트 브로드캐스트
- **EventBroadcaster**: SSE 클라이언트 브로드캐스트

### Shared Components
- **Centralized Models** (Q1): `server/src/models/` — 모든 데이터 모델 정의
- **ResponseHelper**: 통일된 API 응답 포맷 제공
- **ValidationHelper**: Zod 기반 입력값 검증
- **ErrorHandler**: 글로벌 에러 처리 미들웨어
- **Logger**: 구조화된 로깅 컴포넌트

---

## 데이터베이스 컴포넌트

### Models (Centralized - Q1 선택)
- `server/src/models/user.ts`: 사용자(관리자) 모델
- `server/src/models/menu.ts`: 메뉴 모델
- `server/src/models/order.ts`: 주문 모델
- `server/src/models/order_item.ts`: 주문 항목 모델
- `server/src/models/table_session.ts`: 테이블 세션 모델
- `server/src/models/order_history.ts`: 과거 주문 내역 모델

### Database
- **KnexConfig**: Knex.js 구성 및 마이그레이션 관리
- **MigrationManager**: 데이터베이스 마이그레이션 스크립트
- **SeedManager**: 시드 데이터 관리

---

## 인프라 컴포넌트

### Docker Compose
- **PostgreSQLContainer**: PostgreSQL 데이터베이스 컨테이너
- **ServerContainer**: Express 서버 컨테이너
- **ClientCustomerContainer**: 고객 앱 컨테이너
- **ClientAdminContainer**: 관리자 앱 컨테이너

### 환경 구성
- **EnvConfig**: 환경 변수 로드 및 검증
- **DatabaseConfig**: 데이터베이스 연결 구성
- **JWTConfig**: JWT 시크릿 및 만료 설정
