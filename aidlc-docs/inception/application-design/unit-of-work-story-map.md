# Unit of Work - Story Map

## 개요
User Stories를 각 Unit of Work에 매핑합니다.

## Story → Unit 매핑

### Unit 1: Server API
모든 스토리의 백엔드 API를 담당합니다 (각 스토리의 서버 측 구현).

| Story | API 구현 범위 |
|---|---|
| US-C01 | 테이블 초기 설정 API (`POST /api/tables/setup`) |
| US-C02 | 테이블 자동 로그인 API (`POST /api/tables/login`) |
| US-C03, US-C04 | 메뉴 조회 API (`GET /api/menus`, `GET /api/menus/:id`) |
| US-C09 | 주문 생성 API (`POST /api/orders`) |
| US-C10 | 현재 세션 주문 조회 API (`GET /api/orders/current/:id`) |
| US-C11 | 주문 상태 SSE 발행 (`/api/events/orders`) |
| US-A01, US-A02 | 관리자 인증 API (`POST /api/auth/login`, 토큰 검증) |
| US-A03, US-A04, US-A05 | 대시보드 데이터 API + SSE (`/api/events/admin/orders`) |
| US-A06 | 주문 상태 변경 API (`PUT /api/orders/:id/status`) |
| US-A07 | 주문 삭제 API (`DELETE /api/orders/:id`) |
| US-A08 | 테이블 이용 완료 API (`POST /api/tables/:id/complete`) |
| US-A09 | 과거 주문 내역 API (`GET /api/orders/history/:id`) |
| US-A10~A14 | 메뉴 CRUD API (`POST/PUT/DELETE /api/menus`) |

### Unit 2: Customer App
고객용 인터페이스 스토리를 담당합니다.

| Story | UI 구현 범위 |
|---|---|
| US-C01 | TableAuthScreen (초기 설정 화면) |
| US-C02 | 자동 로그인 로직 + 세션 관리 |
| US-C03 | MenuScreen (카테고리별 메뉴 목록) |
| US-C04 | 메뉴 상세 보기 |
| US-C05, US-C06, US-C07, US-C08 | CartScreen + cartStore (장바구니 관리, 로컬 저장) |
| US-C09 | OrderConfirmationScreen (주문 확정 + 5초 리다이렉트) |
| US-C10 | OrderHistoryScreen (현재 세션 주문 내역) |
| US-C11 | SSEListener (주문 상태 실시간 업데이트) |

### Unit 3: Admin App
관리자용 인터페이스 스토리를 담당합니다.

| Story | UI 구현 범위 |
|---|---|
| US-A01 | LoginScreen (관리자 로그인) |
| US-A02 | 세션 유지 + 자동 로그아웃 로직 |
| US-A03 | DashboardScreen (테이블별 카드 그리드) |
| US-A04 | AdminSSEListener (신규 주문 실시간 수신 + 강조) |
| US-A05 | TableDetailScreen (주문 상세 보기) |
| US-A06 | 주문 상태 변경 버튼 |
| US-A07 | 주문 삭제 (확인 팝업) |
| US-A08 | 테이블 이용 완료 처리 |
| US-A09 | 과거 주문 내역 조회 (날짜 필터) |
| US-A10~A14 | MenuManagementScreen (메뉴 CRUD + 순서 조정) |

## Unit별 스토리 수 요약

| Unit | 담당 스토리 수 | 우선순위 |
|---|---|---|
| Server API | 25개 (전체 백엔드) | 모든 스토리의 기반 |
| Customer App | 11개 (US-C01~C11) | Must Have |
| Admin App | 15개 (US-C01 설정 + US-A01~A14) | Must Have (14) + Should Have (1) |

## 구현 순서 (우선순위 기반)

### Phase A: Foundation (Server API)
1. 데이터베이스 스키마 + 마이그레이션
2. 공유 유틸 (ResponseHelper, ErrorHandler, Logger, Validation)
3. 인증 API (US-A01, A02) + 테이블 세션 API (US-C01, C02)
4. 메뉴 API (US-C03, C04, US-A10~A14)
5. 주문 API (US-C09, C10, US-A06, A07) + 테이블 관리 (US-A08, A09)
6. SSE 이벤트 시스템 (US-C11, US-A03, A04, A05)

### Phase B: Client (병렬 개발)
**Customer App**:
1. API 서비스 + 타입 + 자동 로그인 (US-C01, C02)
2. 메뉴 + 장바구니 (US-C03~C08)
3. 주문 + 내역 + SSE (US-C09, C10, C11)

**Admin App**:
1. 로그인 + 세션 (US-A01, A02)
2. 대시보드 + SSE (US-A03, A04, A05)
3. 주문/테이블 관리 (US-A06~A09)
4. 메뉴 관리 (US-A10~A14)

## 커버리지 검증

- ✅ 모든 25개 User Story가 Unit에 할당됨
- ✅ 모든 스토리는 Server API 백엔드 구현 필요
- ✅ 고객 스토리는 Customer App, 관리자 스토리는 Admin App
- ✅ US-C01(테이블 초기 설정)은 관리자가 수행하므로 양쪽 앱 고려
