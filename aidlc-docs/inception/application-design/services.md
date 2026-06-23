# 서비스 레이어 설계

## 개요
Feature 기반 서비스 레이어 구조로, 각 서비스는 특정 도메인의 비즈니스 로직을 캡슐화합니다.

## 서비스 간 협력 패턴

### 1. OrderService 중심 오케스트레이션

**OrderService**는 여러 서비스와 협력하여 주문 흐름을 관리합니다:

```typescript
class OrderService {
  constructor(
    private menuService: MenuService,
    private tableService: TableService,
    private eventService: EventService,
    private orderModel: OrderModel,
    private orderItemModel: OrderItemModel
  ) {}

  async createOrder(
    tableSessionId: number, 
    menuItems: MenuItemDto[], 
    tableNumber: string
  ): Promise<Order> {
    // 1. MenuService 호출 - 메뉴 존재 및 가격 확인
    const menuPrices = await this.menuService.validateMenuItems(menuItems);
    
    // 2. TableService 호출 - 테이블 세션 유효성 확인
    const sessionValid = await this.tableService.validateSession(tableSessionId);
    if (!sessionValid) throw new Error('Invalid table session');
    
    // 3. 주문 및 주문 항목 생성 (트랜잭션)
    const order = await this.orderModel.transaction(async (trx) => {
      const order = await this.orderModel.create({ tableSessionId, tableNumber }, trx);
      
      for (const item of menuItems) {
        await this.orderItemModel.create({
          orderId: order.id,
          menuId: item.menuId,
          quantity: item.quantity,
          unitPrice: menuPrices[item.menuId]
        }, trx);
      }
      
      return order;
    });
    
    // 4. EventService 호출 - 실시간 알림
    await this.eventService.broadcastOrderCreated(order);
    
    return order;
  }
}
```

### 2. AuthService 보안 체인

**AuthService**는 로그인 인증 체인을 구현합니다:

```typescript
class AuthService {
  async authenticate(storeId: string, username: string, password: string): Promise<AuthResult> {
    // 1. 계정 잠금 상태 확인
    const lockStatus = await this.checkFailedAttempts(storeId, username);
    if (lockStatus.isLocked) throw new AccountLockedError(lockStatus.remainingTime);
    
    // 2. 사용자 조회 및 비밀번호 검증
    const user = await this.userModel.findByStoreAndUsername(storeId, username);
    if (!user) {
      await this.incrementFailedAttempts(storeId, username);
      throw new InvalidCredentialsError();
    }
    
    const passwordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordValid) {
      await this.incrementFailedAttempts(storeId, username);
      throw new InvalidCredentialsError();
    }
    
    // 3. 성공 시 실패 횟수 초기화
    await this.resetFailedAttempts(user.id);
    
    // 4. JWT 토큰 생성
    const token = this.generateJWT(user);
    
    return { token, user };
  }
}
```

### 3. EventService 실시간 브로드캐스트 체인

**EventService** (Centralized SSE Service - Q3 선택)는 모든 실시간 이벤트를 중앙에서 관리합니다:

```typescript
class EventService {
  private clients = new Map<string, { res: Response, isAdmin: boolean }>();
  
  registerClient(clientId: string, res: Response, isAdmin: boolean): void {
    this.clients.set(clientId, { res, isAdmin });
    
    // 연결 유지 및 하트비트
    const heartbeat = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(heartbeat);
        this.clients.delete(clientId);
      } else {
        res.write(': heartbeat\n\n');
      }
    }, 30000);
  }
  
  broadcastOrderCreated(order: Order): void {
    const eventData = JSON.stringify({
      type: 'order_created',
      data: {
        orderId: order.id,
        tableNumber: order.tableNumber,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount
      }
    });
    
    // 모든 관리자 클라이언트에 브로드캐스트
    for (const [clientId, client] of this.clients.entries()) {
      if (client.isAdmin) {
        client.res.write(`data: ${eventData}\n\n`);
      }
    }
    
    // 해당 테이블의 고객 클라이언트에도 전송
    const tableClientId = `table_${order.tableSessionId}`;
    if (this.clients.has(tableClientId)) {
      this.clients.get(tableClientId).res.write(`data: ${eventData}\n\n`);
    }
  }
}
```

## 서비스 종속성

### 고객 주문 흐름 서비스 종속성
```
OrderService
  ├── MenuService (메뉴 유효성 확인)
  ├── TableService (테이블 세션 확인)
  ├── EventService (실시간 알림)
  ├── OrderModel (데이터 영속성)
  └── OrderItemModel (데이터 영속성)
```

### 관리자 모니터링 서비스 종속성
```
DashboardService
  ├── OrderService (주문 현황)
  ├── TableService (테이블 세션 현황)
  └── EventService (실시간 업데이트)
```

### 메뉴 관리 서비스 종속성
```
MenuService
  ├── MenuModel (데이터 영속성)
  └── OrderService (메뉴 삭제 시 주문 영향 검사)
```

## 비즈니스 규칙 오케스트레이션

### 1. 주문 생성 규칙 체인
```typescript
const orderValidationRules = [
  // 규칙 1: 테이블 세션 유효성 확인
  (tableSessionId: number) => tableService.validateSession(tableSessionId),
  
  // 규칙 2: 메뉴 가용성 확인
  (menuItems: MenuItemDto[]) => menuService.validateMenuItems(menuItems),
  
  // 규칙 3: 최소 주문 금액 확인
  (menuItems: MenuItemDto[]) => calculateTotal(menuItems) >= 5000,
  
  // 규칙 4: 영업 시간 확인
  () => isWithinBusinessHours(),
];
```

### 2. 메뉴 삭제 규칙 체인
```typescript
const menuDeletionRules = [
  // 규칙 1: 현재 진행 중인 주문에 사용 중인지 확인
  (menuId: number) => orderService.isMenuInActiveOrders(menuId),
  
  // 규칙 2: 대체 메뉴 확인 (선택사항)
  (menuId: number) => menuService.hasReplacementMenu(menuId),
  
  // 규칙 3: 관리자 권한 확인
  () => authService.hasAdminRole(),
];
```

## 서비스 통신 패턴

### 동기적 호출 (HTTP 요청/응답)
- **Controller → Service**: 동기적 호출 (비즈니스 로직 처리)
- **Service → Service**: 직접 메서드 호출 (동일한 프로세스 내)

### 비동기적 이벤트 (SSE)
- **EventService → 클라이언트**: 비동기적 브로드캐스트
- **서비스 → EventService**: 이벤트 발행

### 데이터베이스 트랜잭션
- **Service → Model**: 트랜잭션 범위 내에서 호출
- **Model → Model**: 같은 트랜잭션 내에서 호출

## 에러 처리 체인

### 계층적 에러 처리
```
Controller Layer (HTTP 응답 에러)
  └── Service Layer (비즈니스 로직 에러)
        └── Model Layer (데이터베이스 에러)
              └── Database Layer (PostgreSQL 에러)
```

### 에러 변환 패턴
```typescript
class OrderService {
  async createOrder(...): Promise<Order> {
    try {
      // 비즈니스 로직 실행
    } catch (error) {
      // 데이터베이스 에러 → 비즈니스 에러 변환
      if (error instanceof DatabaseError) {
        throw new BusinessError('주문 생성에 실패했습니다');
      }
      // 외부 서비스 에러 → 적절한 에러로 변환
      if (error instanceof MenuServiceError) {
        throw new ValidationError('유효하지 않은 메뉴입니다');
      }
      throw error;
    }
  }
}
```

## 서비스 확장 포인트

### 1. 플러그인 가능한 검�� 규칙
```typescript
interface OrderValidationRule {
  validate(orderData: OrderData): Promise<ValidationResult>;
}

class OrderService {
  private validationRules: OrderValidationRule[] = [];
  
  addValidationRule(rule: OrderValidationRule): void {
    this.validationRules.push(rule);
  }
}
```

### 2. 이벤트 핸들러 등록
```typescript
interface OrderEventHandler {
  onOrderCreated(order: Order): Promise<void>;
  onOrderStatusChanged(order: Order): Promise<void>;
}

class EventService {
  private handlers: OrderEventHandler[] = [];
  
  registerHandler(handler: OrderEventHandler): void {
    this.handlers.push(handler);
  }
}
```

### 3. 서비스 인터셉터
```typescript
interface ServiceInterceptor {
  before<T>(methodName: string, args: any[]): Promise<void>;
  after<T>(methodName: string, result: T): Promise<void>;
  onError(methodName: string, error: Error): Promise<void>;
}
```
