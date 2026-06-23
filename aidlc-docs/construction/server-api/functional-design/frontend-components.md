# 프론트엔드 컴포넌트 설계

## Customer App (고객용 앱)

### 컴포넌트 계층
```
CustomerApp
├── TableAuthScreen (테이블 미설정 시)
├── MenuLayout (메인 레이아웃)
│   ├── CategoryTabs
│   ├── MenuGrid
│   │   └── MenuCard (×N)
│   ├── MenuDetailModal
│   └── CartButton (장바구니 진입)
├── CartScreen
│   ├── CartItem (×N)
│   └── CartSummary (총액 + 주문 버튼)
├── OrderConfirmationScreen (주문 완료 + 5초 카운트다운)
└── OrderHistoryScreen
    └── OrderHistoryCard (×N, SSE 상태 업데이트)
```

### 컴포넌트별 Props/State

#### MenuCard
- Props: `{ menu: Menu, onAddToCart: (menu) => void }`
- 표시: 이미지, 메뉴명, 가격, 추가 버튼

#### CartScreen
- State (cartStore): `items: CartItem[], totalAmount: number`
- 기능: 수량 증감, 항목 삭제, 전체 비우기

#### OrderConfirmationScreen
- State: `{ orderId: number, countdown: number }`
- 동작: 주문번호 표시, 5초 카운트다운 후 메뉴 화면 리다이렉트

#### OrderHistoryScreen
- State (orderStore): `currentOrders: Order[]`
- SSE: order_status_changed 이벤트로 상태 실시간 갱신

### 상태 관리 (Zustand Stores)
| Store | 상태 | 주요 액션 |
|---|---|---|
| authStore | tableSession, sessionToken | setupTable, autoLogin |
| menuStore | menus[], categories[] | fetchMenus |
| cartStore | items[], totalAmount | addItem, removeItem, updateQuantity, clearCart (localStorage 동기화) |
| orderStore | currentOrders[] | createOrder, fetchCurrentOrders, applySSEUpdate |

### 사용자 인터랙션 흐름
```
메뉴 탐색 → 메뉴 카드 탭 → 상세 모달 → 장바구니 추가
→ 장바구니 화면 → 수량 조절 → 주문하기
→ 주문 확인 (번호 표시) → 5초 후 메뉴 화면
→ 주문 내역에서 상태 확인 (SSE 실시간)
```

### API 통합 포인트 (Customer)
| 컴포넌트 | API | 메서드 |
|---|---|---|
| TableAuthScreen | `/api/tables/setup`, `/api/tables/login` | POST |
| MenuGrid | `/api/menus` | GET |
| OrderConfirmationScreen | `/api/orders` | POST |
| OrderHistoryScreen | `/api/orders/current/:id` | GET |
| SSEListener | `/api/events/orders` | EventSource |

---

## Admin App (관리자용 앱)

### 컴포넌트 계층
```
AdminApp
├── LoginScreen
├── AdminLayout (인증 후)
│   ├── Sidebar (네비게이션)
│   ├── DashboardScreen
│   │   └── TableCard (×N, SSE 실시간 강조)
│   │       └── OrderPreview (최신 주문 미리보기)
│   ├── TableDetailModal (테이블 카드 클릭)
│   │   ├── OrderDetailCard (×N)
│   │   │   ├── StatusButtons (상태 변경)
│   │   │   └── DeleteButton (주문 삭제)
│   │   ├── CompleteSessionButton (이용 완료)
│   │   └── OrderHistoryButton (과거 내역)
│   ├── OrderHistoryModal (날짜 필터)
│   └── MenuManagementScreen
│       ├── MenuListTable
│       ├── MenuFormModal (등록/수정)
│       └── DeleteConfirmDialog
```

### 컴포넌트별 Props/State

#### DashboardScreen
- State (orderStore, tableStore): `dashboardItems: TableDashboardItem[]`
- SSE: order_created, order_status_changed, order_deleted 실시간 수신
- 신규 주문 시 해당 TableCard 색상 강조 + 애니메이션

#### TableCard
- Props: `{ item: TableDashboardItem, onClick: () => void, isNew: boolean }`
- 표시: 테이블번호, 총 주문액, 최신 주문 미리보기

#### TableDetailModal
- Props: `{ tableSessionId: number }`
- 기능: 전체 주문 상세, 상태 변경, 삭제, 이용 완료, 과거 내역

#### MenuFormModal
- State: `{ name, price, category, description, imageUrl }`
- 검증: 필수 필드, 가격 > 0

### 상태 관리 (Zustand Stores)
| Store | 상태 | 주요 액션 |
|---|---|---|
| authStore | token, user, isAuthenticated | login, logout, validateToken |
| dashboardStore | dashboardItems[] | fetchDashboard, applySSEUpdate |
| orderStore | currentOrders[] | updateStatus, deleteOrder, fetchHistory |
| menuStore | menus[] | fetchMenus, createMenu, updateMenu, deleteMenu, reorder |

### 사용자 인터랙션 흐름
```
로그인 → 대시보드 (테이블 그리드)
→ [신규 주문 SSE 수신 → 카드 강조]
→ 테이블 카드 클릭 → 상세 보기
→ 상태 변경 (대기중→준비중→완료) / 주문 삭제 / 이용 완료
→ 메뉴 관리 → 등록/수정/삭제
```

### API 통합 포인트 (Admin)
| 컴포넌트 | API | 메서드 |
|---|---|---|
| LoginScreen | `/api/auth/login` | POST |
| DashboardScreen | `/api/orders/dashboard` | GET |
| StatusButtons | `/api/orders/:id/status` | PUT |
| DeleteButton | `/api/orders/:id` | DELETE |
| CompleteSessionButton | `/api/tables/:id/complete` | POST |
| OrderHistoryModal | `/api/orders/history/:id` | GET |
| MenuManagementScreen | `/api/menus` | GET/POST/PUT/DELETE |
| AdminSSEListener | `/api/events/admin/orders` | EventSource |

---

## 공통 컴포넌트 (Shared)

| 컴포넌트 | 용도 | 사용처 |
|---|---|---|
| MenuCard | 메뉴 카드 표시 | Customer |
| CartItem | 장바구니 항목 | Customer |
| OrderCard | 주문 카드 | Admin |
| TableCard | 테이블 카드 | Admin |
| LoadingSpinner | 로딩 표시 | 공통 |
| ErrorBoundary | 에러 경계 | 공통 |
| ConfirmDialog | 확인 팝업 | 공통 |

## 폼 검증 규칙 (Frontend)
- 메뉴 등록: name 필수, price 양수, category 필수
- 로그인: 모든 필드 필수, password 8자 이상
- 테이블 설정: 모든 필드 필수

## SSE 재연결 전략
- 연결 끊김 감지 시 자동 재연결 (지수 백오프)
- 최대 재시도 후 사용자에게 새로고침 안내
- 페이지 visibility 변경 시 연결 상태 확인
