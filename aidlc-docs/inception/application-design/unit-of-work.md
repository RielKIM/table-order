# Unit of Work - 테이블오더 MVP

## 개요
테이블오더 MVP 시스템을 3개의 Deployment Unit으로 분해합니다.

## Unit 정의

### Unit 1: Server API (서버 API)
** 목적 **: 백엔드 REST API 제공 및 데이터베이스 관리

** 책임 **:
- 사용자 인증 (JWT 기반 로그인)
- 메뉴 CRUD (조회/등록/수정/삭제)
- 주문 생성 및 관리 (주문 상태 변경 포함)
- 테이블 세션 관리
- 실시간 SSE 이벤트 브로드캐스트

** 배포 단위 **:
- Express.js + TypeScript + Knex.js
- PostgreSQL 데이터베이스
- Docker 컨테이너로 배포

** 실행 주소 **: `http://localhost:3000`

---

### Unit 2: Customer App (고객용 앱)
** 목적 **: 테이블 고객을 위한 주문 인터페이스 제공

** 책임 **:
- 테이블 로그인 및 세션 관리
- 메뉴 조회 및 탐색
- 장바구니 관리
- 주문 생성 및 확인
- 주문 내역 조회
- SSE 실시간 주문 상태 수신

** 배포 단위 **:
- React + TypeScript + Vite
- Zustand 상태 관리
- Tailwind CSS 스타일
- Docker 컨테이너로 배포 (nginx)

** 실행 주소 **: `http://localhost:3001`

---

### Unit 3: Admin App (관리자용 앱)
** 목적 **: 매장 운영자를 위한 관리 인터페이스 제공

** 책임 **:
- 관리자 로그인 및 세션 관리
- 실시간 주문 모니터링 (SSE)
- 테이블 대시보드 표시
- 주문 상태 변경 (대기중→준비중→완료)
- 테이블 세션 관리 (이용 완료 처리)
- 과거 주문 내역 조회
- 메뉴 CRUD (관리자 전용)

** 배포 단위 **:
- React + TypeScript + Vite
- Zustand 상태 관리
- Tailwind CSS 스타일
- Docker 컨테이너로 배포 (nginx)

** 실행 주소 **: `http://localhost:3002`

---

## Unit 간 의존성

| Unit | 의존 대상 | 설명 |
|---|---|---|
| Server API | - | 독립 실행 가능, 다른 단위 없음 |
| Customer App | Server API | 모든 API 호출은 Server API를 통해 |
| Admin App | Server API | 모든 API 호출은 Server API를 통해 |

---

## 공유 코드 (Strict 분리 - Q2 선택)

### `server/src/shared/` (서버 공유)
- ResponseHelper: 통일된 API 응답 포맷
- ValidationHelper: Zod 기반 입력 검증
- ErrorHandler: 글로벌 에러 처리
- Logger: 구조화된 로깅
- JWTConfig: JWT 시크릿 및 만료 설정

### `client/src/shared/` (클라이언트 공유)
- Components: MenuCard, CartItem, OrderCard, TableCard
- Services: api.ts (axios 인스턴스), sse.ts
- Types: 공통 타입 정의 (User, Menu, Order, TableSession 등)

---

## 데이터베이스 접근 (Shared Database - Q3 선택)

모든 Unit이 동일한 PostgreSQL 데이터베이스를 공유합니다:
- **Database**: `table_order`
- **Schema**: public (단위별 스키마 분리 없음)
- **접근 방식**: Knex.js를 통한 모든 데이터베이스 접근

---

## 개발 순서 (Parallel - Q4 선택)

1. **Step 1**: 서버 API + 데이터베이스 스키마 설계 (기반 마련)
2. **Step 2**: 클라이언트 API 서비스 및 타입 정의 정의 (계약 확정)
3. **Step 3**: Customer App 및 Admin App 병렬 개발 시작

---

## Unit 개요 차트

```
┌─────────────────────────────────────────────────────────────┐
│                     테이블오더 MVP 시스템                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌───────────┐ │
│  │   Server API    │    │  Customer App   │    │ Admin App │ │
│  │  (Port 3000)    │◄──►│  (Port 3001)    │    │(Port 3002)│ │
│  │                 │    │                 │    │           │ │
│  │ - Auth API      │    │ - Menu Screen   │    │ - Login   │ │
│  │ - Menu API      │    │ - Cart Screen   │    │ - Dashboard││
│  │ - Order API     │    │ - Order Screen  │    │ - Orders  │ │
│  │ - Table API     │    │ - History Screen│    │ - Tables  │ │
│  │ - SSE Events    │    │ - SSE Listener  │    │ - SSE     │ │
│  │ - Shared Utils  │    │ - Shared Store  │    │ - Store   │ │
│  └────────┬────────┘    └─────────────────┘    └───────────┘ │
│           │                                                   │
│           ▼                                                   │
│     ┌─────────────────┐                                      │
│     │   PostgreSQL    │                                      │
│     │   Database      │                                      │
│     └─────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Strategy

### 개발 단계
1. **Database Schema + Server API**: PostgreSQL 스키마 및 Express API 구현
2. **Client API Services**: TypeScript 타입 정의 및 axios 서비스
3. **Customer App**: 메뉴 탐색, 장바구니, 주문 플로우 구현
4. **Admin App**: 대시보드, 주문 관리, 테이블 관리 구현
5. **Integration Testing**: End-to-end 테스트 및 SSE 연결 검증

### 통합 포인트
- **API Contract**: 모든 클라이언트는 서버 API 스펙에 의존
- **SSE Connection**: 고객/관리자 모두 서버의 SSE 엔드포인트에 연결
- **Database**: 모든 Unit이 동일한 PostgreSQL 데이터베이스 사용

### 배포 전략
- 개발 환경: Docker Compose로 4개 컨테이너 (postgres + server + customer + admin)
- 프로덕션 환경: 각 Unit을 독립 배포 (ECS/Fargate 등)