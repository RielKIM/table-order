# 컴포넌트 메서드 시그니처

## 서버 컴포넌트 메서드

### AuthController
```typescript
POST /api/auth/login
Request: { storeId: string, username: string, password: string }
Response: { token: string, expiresAt: Date }
```

```typescript
POST /api/auth/validate-token
Request: { token: string }
Response: { valid: boolean, user?: { storeId: string, username: string } }
```

### AuthService
```typescript
authenticate(storeId: string, username: string, password: string): Promise<{ token: string, user: User }>
validateToken(token: string): Promise<{ valid: boolean, user?: User }>
hashPassword(password: string): Promise<string>
checkFailedAttempts(storeId: string, username: string): Promise<{ isLocked: boolean, remainingTime?: number }>
resetFailedAttempts(storeId: string, username: string): Promise<void>
```

### AuthMiddleware
```typescript
verifyJWT(req: Request, res: Response, next: NextFunction): void
requireAdminRole(req: Request, res: Response, next: NextFunction): void
```

---

### MenuController
```typescript
GET /api/menus
Query: { category?: string }
Response: Menu[]
```

```typescript
GET /api/menus/:id
Response: Menu
```

```typescript
POST /api/menus
Request: { name: string, price: number, description?: string, category: string, imageUrl?: string }
Response: Menu
```

```typescript
PUT /api/menus/:id
Request: { name?: string, price?: number, description?: string, category?: string, imageUrl?: string }
Response: Menu
```

```typescript
DELETE /api/menus/:id
Response: { success: boolean }
```

### MenuService
```typescript
getMenus(category?: string): Promise<Menu[]>
getMenuById(id: number): Promise<Menu | null>
createMenu(menuData: CreateMenuDto): Promise<Menu>
updateMenu(id: number, menuData: UpdateMenuDto): Promise<Menu | null>
deleteMenu(id: number): Promise<boolean>
reorderMenus(menuOrder: Array<{ id: number, displayOrder: number }>): Promise<void>
```

---

### OrderController
```typescript
POST /api/orders
Request: { tableSessionId: number, menuItems: Array<{ menuId: number, quantity: number }> }
Response: { orderId: number, createdAt: Date, totalAmount: number }
```

```typescript
GET /api/orders/current/:tableSessionId
Response: Order[]
```

```typescript
GET /api/orders/history/:tableSessionId
Response: OrderHistory[]
```

```typescript
PUT /api/orders/:id/status
Request: { status: 'pending' | 'preparing' | 'completed' }
Response: Order
```

```typescript
DELETE /api/orders/:id
Response: { success: boolean }
```

### OrderService
```typescript
createOrder(tableSessionId: number, menuItems: MenuItemDto[], tableNumber: string): Promise<Order>
getCurrentOrders(tableSessionId: number): Promise<Order[]>
getOrderHistory(tableSessionId: number): Promise<OrderHistory[]>
updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order | null>
deleteOrder(orderId: number): Promise<boolean>
notifyOrderCreated(order: Order): Promise<void>
notifyOrderStatusChanged(order: Order): Promise<void>
```

---

### TableController
```typescript
POST /api/tables/setup
Request: { storeId: string, tableNumber: string, tablePassword: string }
Response: { sessionToken: string, expiresAt: Date }
```

```typescript
POST /api/tables/login
Request: { sessionToken: string }
Response: { valid: boolean, tableSession?: TableSession }
```

```typescript
POST /api/tables/:sessionId/complete
Response: { success: boolean }
```

```typescript
GET /api/tables/dashboard
Response: TableDashboardItem[]
```

### TableService
```typescript
setupTable(storeId: string, tableNumber: string, password: string): Promise<{ sessionToken: string, tableSession: TableSession }>
validateTableLogin(sessionToken: string): Promise<{ valid: boolean, tableSession?: TableSession }>
completeTableSession(sessionId: number): Promise<boolean>
getDashboardData(): Promise<TableDashboardItem[]>
extendSession(sessionId: number): Promise<void>
```

---

### SSEController
```typescript
GET /api/events/orders (SSE stream)
Headers: { Authorization: Bearer <token> }
Stream: EventSource SSE stream
```

```typescript
GET /api/events/admin/orders (SSE stream)
Headers: { Authorization: Bearer <token> }
Stream: EventSource SSE stream
```

### EventService
```typescript
registerClient(clientId: string, res: Response, isAdmin: boolean): void
broadcastOrderCreated(order: Order): void
broadcastOrderStatusChanged(order: Order): void
broadcastTableSessionUpdated(sessionId: number): void
removeClient(clientId: string): void
getActiveClients(): Map<string, { res: Response, isAdmin: boolean }>
```

---

## 프론트엔드 컴포넌트 메서드

### Zustand Feature Stores (Q4: Feature Stores)
```typescript
// client/src/shared/store/authStore.ts
createAuthStore(): {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (storeId: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}
```

```typescript
// client/src/shared/store/menuStore.ts
createMenuStore(): {
  menus: Menu[];
  categories: string[];
  loading: boolean;
  getMenus: (category?: string) => Promise<Menu[]>;
  getMenuById: (id: number) => Promise<Menu | null>;
  createMenu: (menuData: CreateMenuDto) => Promise<Menu>;
}
```

```typescript
// client/src/shared/store/cartStore.ts
createCartStore(): {
  items: CartItem[];
  totalAmount: number;
  addItem: (menu: Menu, quantity?: number) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}
```

```typescript
// client/src/shared/store/orderStore.ts
createOrderStore(): {
  currentOrders: Order[];
  orderHistory: OrderHistory[];
  loading: boolean;
  createOrder: (tableSessionId: number, items: CartItem[]) => Promise<Order>;
  getCurrentOrders: (tableSessionId: number) => Promise<Order[]>;
  getOrderHistory: (tableSessionId: number) => Promise<OrderHistory[]>;
}
```

### SSEListener 컴포넌트 메서드
```typescript
SSEListener.connect(url: string, options: { 
  onMessage: (event: MessageEvent) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
}): EventSource

SSEListener.disconnect(): void

SSEListener.reconnect(): void
```

---

## 데이터베이스 모델 메서드

### User Model
```typescript
User.findByStoreAndUsername(storeId: string, username: string): Promise<User | null>
User.create(userData: CreateUserDto): Promise<User>
User.updatePassword(userId: number, hashedPassword: string): Promise<void>
User.incrementFailedAttempts(userId: number): Promise<void>
User.resetFailedAttempts(userId: number): Promise<void>
```

### Menu Model
```typescript
Menu.findAll(category?: string): Promise<Menu[]>
Menu.findById(id: number): Promise<Menu | null>
Menu.create(menuData: CreateMenuDto): Promise<Menu>
Menu.update(id: number, menuData: UpdateMenuDto): Promise<Menu | null>
Menu.delete(id: number): Promise<boolean>
Menu.updateOrder(menuOrder: Array<{ id: number, displayOrder: number }>): Promise<void>
```

### Order Model
```typescript
Order.create(orderData: CreateOrderDto): Promise<Order>
Order.findById(id: number): Promise<Order | null>
Order.findByTableSession(sessionId: number): Promise<Order[]>
Order.updateStatus(id: number, status: OrderStatus): Promise<Order | null>
Order.delete(id: number): Promise<boolean>
Order.calculateTotal(orderId: number): Promise<number>
```

### TableSession Model
```typescript
TableSession.create(sessionData: CreateTableSessionDto): Promise<TableSession>
TableSession.findByToken(sessionToken: string): Promise<TableSession | null>
TableSession.completeSession(sessionId: number): Promise<boolean>
TableSession.findActiveByStore(storeId: string): Promise<TableSession[]>
TableSession.findDashboardData(): Promise<TableDashboardItem[]>
```
