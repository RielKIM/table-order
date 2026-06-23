# 비즈니스 로직 모델

## 1. 인증 비즈니스 로직 (Authentication)

### 관리자 로그인 흐름
```
1. (storeId, username, password) 입력 수신
2. 계정 잠금 확인:
   - lockedUntil이 현재 시각보다 미래면 → AccountLockedError (남은 시간 반환)
3. 사용자 조회 (storeId + username):
   - 없으면 → failedAttempts 증가 후 InvalidCredentialsError
4. 비밀번호 검증 (bcrypt.compare):
   - 불일치 → failedAttempts 증가, 5회 도달 시 lockedUntil = now + 15분, InvalidCredentialsError
5. 성공:
   - failedAttempts = 0, lockedUntil = null
   - JWT 발급 (payload: storeId, username, userId / 만료: 16시간)
6. { token, expiresAt } 반환
```

### JWT 토큰 검증 흐름
```
1. Authorization 헤더에서 Bearer 토큰 추출
2. jwt.verify (서명, 만료 확인)
   - 실패 → 401 Unauthorized
3. payload를 req.user에 주입
4. next() 호출
```

## 2. 테이블 세션 비즈니스 로직 (Table Session)

### 테이블 초기 설정 흐름
```
1. (storeId, tableNumber, tablePassword) 입력 수신
2. 매장 존재 확인 (storeId가 users에 존재)
   - 없으면 → StoreNotFoundError
3. sessionToken 생성 (UUID + 서명)
4. TableSession 생성:
   - activatedAt = null (첫 주문 전)
   - expiresAt = now + 16시간
   - isActive = true
5. { sessionToken, expiresAt } 반환 (로컬 저장용)
```

### 자동 로그인 흐름
```
1. sessionToken 수신
2. TableSession 조회 (sessionToken)
   - 없으면 → 재설정 필요 응답
3. 만료 확인:
   - expiresAt < now → 세션 갱신 (expiresAt 연장) 또는 재로그인
4. { valid: true, tableSession } 반환
```

### 테이블 이용 완료 흐름
```
1. sessionId 수신
2. 현재 세션의 모든 주문 조회
3. 트랜잭션:
   a. 각 주문을 OrderHistory로 아카이브 (itemsSnapshot 포함)
   b. 원본 Order, OrderItem 삭제 (또는 보관 정책에 따라)
   c. TableSession.isActive = false, completedAt = now
   d. 새 세션 생성 (다음 고객용, activatedAt=null)
4. 성공 응답
```

## 3. 주문 생성 비즈니스 로직 (Order Creation)

### 주문 생성 흐름
```
1. (tableSessionId, menuItems[]) 입력 수신
2. 테이블 세션 유효성 확인:
   - isActive=false → SessionInactiveError
3. 메뉴 유효성 확인:
   - 각 menuId가 존재하고 isActive=true인지 확인
   - 비활성/없는 메뉴 → MenuNotAvailableError
4. 금액 계산: totalAmount = Σ(menu.price × quantity)
5. 트랜잭션:
   a. 세션의 activatedAt이 null이면 → activatedAt = now (첫 주문, 세션 시작)
   b. Order 생성 (status='pending', totalAmount)
   c. 각 항목을 OrderItem으로 생성 (menuName, unitPrice 스냅샷)
6. SSE 이벤트 발행: broadcastOrderCreated(order)
7. { orderId, createdAt, totalAmount } 반환
```

## 4. 주문 상태 관리 로직 (Order Status)

### 상태 전이 (단방향 + 취소)
```
허용된 전이:
  pending → preparing → completed (단방향)
  any → deleted (취소/삭제는 언제든 가능)

금지된 전이:
  completed → preparing (역방향 불가)
  preparing → pending (역방향 불가)

상태 변경 흐름:
1. (orderId, newStatus) 수신
2. 현재 주문 조회
3. 전이 유효성 검증 (단방향 규칙)
   - 위반 시 → InvalidStatusTransitionError
4. status 업데이트, updatedAt = now
5. SSE 이벤트 발행: broadcastOrderStatusChanged(order)
   - 관리자 화면 + 해당 테이블 고객 화면 모두에 전송
```

### 주문 삭제 흐름 (관리자 직권)
```
1. orderId 수신
2. 주문 조회
3. 트랜잭션:
   a. OrderItem 삭제 (CASCADE)
   b. Order 삭제
   c. 테이블 총 주문액 재계산
4. SSE 이벤트 발행: broadcastOrderDeleted(tableSessionId)
5. 성공 응답
```

## 5. 메뉴 관리 로직 (Menu Management)

### 메뉴 등록
```
1. (name, price, category, description?, imageUrl?) 수신
2. 검증: name 비어있지 않음, price > 0
3. displayOrder = 현재 카테고리 최대값 + 1
4. Menu 생성 (isActive=true)
5. 생성된 Menu 반환
```

### 메뉴 삭제 (Soft Delete)
```
1. menuId 수신
2. Menu.isActive = false 설정
3. 고객 메뉴 조회 시 isActive=true만 표시
4. 기존 주문의 OrderItem은 스냅샷으로 보존됨
5. 성공 응답
```

### 메뉴 조회 (고객용)
```
1. category? 수신
2. isActive=true인 메뉴만 조회
3. displayOrder 순으로 정렬
4. 카테고리 필터 적용 (있으면)
5. Menu[] 반환
```

## 6. SSE 이벤트 발행 로직 (Real-time Events)

### 이벤트 타입
| 이벤트 | 대상 | 페이로드 |
|---|---|---|
| order_created | 관리자 전체 + 해당 테이블 고객 | orderId, tableNumber, totalAmount, createdAt |
| order_status_changed | 관리자 전체 + 해당 테이블 고객 | orderId, status, tableNumber |
| order_deleted | 관리자 전체 + 해당 테이블 고객 | orderId, tableSessionId |
| table_session_completed | 관리자 전체 | tableSessionId, tableNumber |

### 브로드캐스트 흐름
```
1. 이벤트 발생 (주문 생성/변경/삭제)
2. EventService가 등록된 클라이언트 맵 순회
3. 관리자 클라이언트: 모든 이벤트 수신
4. 고객 클라이언트: 자신의 tableSessionId 관련 이벤트만 수신
5. SSE data 포맷으로 전송: `data: {JSON}\n\n`
6. 30초 하트비트로 연결 유지
```

## 7. 대시보드 데이터 집계 로직

### 테이블별 대시보드 흐름
```
1. 활성 세션 전체 조회 (isActive=true)
2. 각 세션별:
   - 현재 주문 목록 조회
   - 총 주문액 합산
   - 최신 주문 N개 미리보기
3. TableDashboardItem[] 반환:
   { tableNumber, tableSessionId, totalAmount, recentOrders[], orderCount }
```
