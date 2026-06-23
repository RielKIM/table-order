# 테이블오더 MVP 애플리케이션 설계 문서

## 설계 결정 요약

### 결정된 아키텍처 패턴
1. **Feature-Based API 계층** (Q2: C 선택)
   - 도메인별 feature 디렉토리 구조
   - 각 feature: Controller + Service + Model
   - 예: `server/src/features/auth/`, `server/src/features/orders/`

2. **Centralized Models** (Q1: A 선택)
   - `server/src/models/`에 모든 데이터 모델 통합
   - Knex.js 기반 쿼리 빌더 사용
   - 마이그레이션 관리 포함

3. **Centralized SSE Service** (Q3: A 선택)
   - 중앙 집중식 실시간 이벤트 서비스
   - 모든 SSE 연결을 EventService에서 관리
   - 고객/관리자별 브로드캐스트

4. **Zustand Feature Stores** (Q4: A 선택)
   - 도메인별 스토어 분리 (authStore, menuStore, cartStore, orderStore)
   - 로컬 저장소 연동 (장바구니)
   - React Query 대신 간단한 상태 관리

5. **Middleware 기반 인증** (Q5: A 선택)
   - JWT 검증 미들웨어
   - 역할 기반 접근 제어 미들웨어
   - 로그인 시도 제한 미들웨어

---

## 데이터베이스 스키마 설계

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     User        │     │     TableSession│     │      Order      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id: PK          │     │ id: PK          │     │ id: PK          │
│ storeId: string │◄────┤ storeId: FK     │────►│ tableSessionId:FK│
│ username: string│     │ tableNumber:string│   │ tableNumber:string│
│ hashedPassword  │     │ sessionToken    │     │ status: enum    │
│ failedAttempts  │     │ expiresAt: Date │     │ totalAmount     │
│ lockedUntil     │     │ isActive: boolean│    │ createdAt: Date │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
          ┌─────────────────┐                  ┌────────▼────────┐
          │      Menu       │                  │   OrderItem     │
          ├─────────────────┤                  ├─────────────────┤
          │ id: PK          │◄─────────────────┤ id: PK          │
          │ name: string    │                  │ orderId: FK     │
          │ price: number   │                  │ menuId: FK      │
          │ category: string│                  │ quantity: int   │
          │ description     │                  │ unitPrice:number│
          │ imageUrl        │                  └─────────────────┘
          │ displayOrder    │
          │ isActive: boolean
          └─────────────────┘
          
┌─────────────────┐
│   OrderHistory  │
├─────────────────┤
│ id: PK          │
│ orderId: FK     │
│ tableSessionId:FK│
│ tableNumber     │
│ status: string  │
│ totalAmount     │
│ createdAt: Date │
│ completedAt: Date│
└─────────────────┘
```

### 테이블 정의

#### users (관리자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, username)
);
```

#### menus
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### table_sessions
```sql
CREATE TABLE table_sessions (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(50) NOT NULL REFERENCES users(store_id),
  table_number VARCHAR(10) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP
);
```

#### orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  table_session_id INTEGER NOT NULL REFERENCES table_sessions(id),
  table_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'preparing', 'completed')),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### order_items
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### order_history
```sql
CREATE TABLE order_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  table_session_id INTEGER NOT NULL,
  table_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 인덱스 전략
```sql
-- 자주 조회되는 필드
CREATE INDEX idx_orders_table_session ON orders(table_session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_table_sessions_token ON table_sessions(session_token);
CREATE INDEX idx_table_sessions_active ON table_sessions(is_active);
CREATE INDEX idx_menus_category ON menus(category);
CREATE INDEX idx_users_store_username ON users(store_id, username);

-- 검색 성능
CREATE INDEX idx_menus_name ON menus(name);
```

---

## API 설계

### 엔드포인트 구조

#### 인증 (Authentication)
```
GET    /api/auth/validate-token   - 토큰 검증
POST   /api/auth/login            - 로그인
```

#### 메뉴 (Menus)
```
GET    /api/menus                 - 메뉴 목록 조회 (카테고리 필터 가능)
GET    /api/menus/:id             - 메뉴 상세 조회
POST   /api/menus                 - 메뉴 생성
PUT    /api/menus/:id             - 메뉴 수정
DELETE /api/menus/:id             - 메뉴 삭제
PUT    /api/menus/reorder         - 메뉴 순서 변경
```

#### 주문 (Orders)
```
POST   /api/orders                - 주문 생성
GET    /api/orders/current/:tableSessionId - 현재 세션 주문 조회
GET    /api/orders/history/:tableSessionId - 과거 주문 조회
PUT    /api/orders/:id/status     - 주문 상태 변경
DELETE /api/orders/:id            - 주문 삭제
GET    /api/orders/dashboard      - 관리자 대시보드 데이터
```

#### 테이블 (Tables)
```
POST   /api/tables/setup          - ���이블 초기 설정
POST   /api/tables/login          - 테이블 로그인
POST   /api/tables/:sessionId/complete - 테이블 이용 완료 처리
GET    /api/tables/dashboard      - 테이블 대시보드 데이터
```

#### 이벤트 (Events - SSE)
```
GET    /api/events/orders         - 고객용 주문 이벤트 스트림
GET    /api/events/admin/orders   - 관리자용 주문 이벤트 스트림
```

### 응답 포맷 표준
```typescript
// 성공 응답
{
  "success": true,
  "data": T,
  "pagination": { // 페이징 시
    "page": number,
    "limit": number,
    "total": number
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": string,     // "AUTH_INVALID_CREDENTIALS"
    "message": string   // "Invalid username or password"
  }
}
```

### 보안 헤더 (Security Extension 준수)
```typescript
// Express middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

## 프론트엔드 아키텍처

### 폴더 구조
```
client/
├── src/
│   ├── apps/
│   │   ├── customer/           # 고객 앱
│   │   │   ├── components/     # 고객 전용 컴포넌트
│   │   │   ├── pages/         # 고객 페이지
│   │   │   └── App.tsx
│   │   └── admin/             # 관리자 앱
│   │       ├── components/    # 관리자 전용 컴포넌트
│   │       ├── pages/        # 관리자 페이지
│   │       └── App.tsx
│   ├── shared/
│   │   ├── components/       # 공통 컴포넌트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── store/           # Zustand Feature Stores
│   │   │   ├── authStore.ts
│   │   │   ├── menuStore.ts
│   │   │   ├── cartStore.ts
│   │   │   └── orderStore.ts
│   │   ├── services/        # API 서비스
│   │   └── types/           # TypeScript 타입
│   └── main.tsx
```

### 상태 관리 흐름
```typescript
// 예: 주문 생성 흐름
1. 고객 → 장바구니 추가 → cartStore.addItem()
2. 고객 → 주문하기 → cartStore.getItems()
3. orderStore.createOrder(cartItems)
4. axios POST /api/orders
5. 서버 응답 → orderStore.updateCurrentOrders()
6. cartStore.clearCart()
7. localStorage.clear()
```

### SSE 통합
```typescript
// SSEListener 컴포넌트
const SSEListener = ({ tableSessionId, isAdmin }) => {
  useEffect(() => {
    const url = isAdmin 
      ? '/api/events/admin/orders' 
      : `/api/events/orders?session=${tableSessionId}`;
    
    const eventSource = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 이벤트 타입별 처리
      switch (data.type) {
        case 'order_created':
          orderStore.addOrder(data.data);
          break;
        case 'order_status_changed':
          orderStore.updateOrderStatus(data.data);
          break;
      }
    };
    
    return () => eventSource.close();
  }, [tableSessionId, isAdmin, token]);
};
```

---

## 보안 설계 (Security Extension 적용)

### 인증/인가 계층
1. **JWT 기반 인증**
   - Access Token: 16시간 유효기간
   - 서버 사이드 검증 only
   - HttpOnly, Secure, SameSite=Strict 쿠키

2. **로그인 시도 제한**
   - 5회 연속 실패 → 15분 계정 잠금
   - bcrypt 해싱 (adaptive algorithm)
   - 취약한 비밀번호 검사

3. **입력 검증**
   - Zod 스키마 기반 검증
   - SQL Injection 방지 (Knex parameterized queries)
   - XSS 방지 (HTML escaping)

### 네트워크 보안
```typescript
// CORS 설정
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

## 테스트 전략

### 단위 테스트 (Unit Testing)
- **Server**: Jest + Supertest (API 엔드포인트)
- **Service Layer**: 비즈니스 로직 검증
- **Model Layer**: 데이터베이스 쿼리 검증

### 통합 테스트 (Integration Testing)
- **API 통합**: 서버 ↔ 데이터베이스 통합 테스트
- **SSE 통합**: 실시간 이벤트 흐름 테스트
- **인증 통합**: JWT 기반 인증 흐름 테스트

### E2E 테스트 (End-to-End Testing)
- **고객 주문 플로우**: 메뉴 → 장바구니 → 주문 → 상태 확인
- **관리자 관리 플로우**: 로그인 → 대시보드 → 주문 관리 → 테이블 관리

---

## 배포 아키텍처

### 개발 환경 (Docker Compose)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: table_order
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  server:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
    depends_on:
      - postgres
  
  client-customer:
    build: ./client
    ports:
      - "3001:3000"
    environment:
      VITE_API_URL: http://localhost:3000
  
  client-admin:
    build: ./client
    ports:
      - "3002:3000"
    environment:
      VITE_API_URL: http://localhost:3000
      VITE_APP_TYPE: admin

volumes:
  postgres_data:
```

### 빌드 및 배포 프로세스
1. **빌드**: `npm run build:server && npm run build:client`
2. **테스트**: `npm run test` (Jest + Vitest)
3. **마이그레이션**: `npm run migrate:up`
4. **배포**: Docker 컨테이너 배포

---

## 모니터링 및 로깅

### 로깅 구조 (Security Extension SECURITY-03)
```typescript
// 구조화된 로깅
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 모니터링 지표
1. **성능**: API 응답 시간, SSE 연결 수
2. **비즈니스**: 일일 주문 수, 테이블 사용률
3. **보안**: 실패한 로그인 시도, 인가 실패
4. **오류**: 서버 에러율, 클라이언트 오류

---

## 확장성 고려사항

### 수평 확장 가능한 컴포넌트
1. **EventService**: Redis Pub/Sub으로 확장 가능
2. **Database**: PostgreSQL replica 추가 가능
3. **API 서버**: 로드 밸런서 뒤 다중 인스턴스

### 미래 확장 포인트
1. **결제 시스템**: PG사 연동 포인트
2. **재고 관리**: 주방 재고 관리 시스템
3. **분석 대시보드**: 매출 분석 및 보고서
4. **모바일 앱**: React Native로 확장
