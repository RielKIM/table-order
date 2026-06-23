# 도메인 엔티티

## 적용된 설계 결정
- Q1: 주문번호 = DB Auto-increment ID
- Q2: 주문 상태 = 단방향 전이 + 취소(삭제)
- Q3: 테이블 세션 = 주문 트리거 (첫 주문 시 activated_at 기록)
- Q4: 주문 제약 = 없음 (1개 이상)
- Q5: 메뉴 삭제 = Soft Delete (is_active=false)
- Q6: 관리자 계정 = 시드 데이터

---

## Entity: User (관리자)

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 사용자 식별자 |
| storeId | string | NOT NULL | 매장 식별자 |
| username | string | NOT NULL | 사용자명 |
| hashedPassword | string | NOT NULL | bcrypt 해시 비밀번호 |
| failedAttempts | number | DEFAULT 0 | 로그인 실패 횟수 |
| lockedUntil | Date \| null | NULL 허용 | 계정 잠금 해제 시각 |
| createdAt | Date | DEFAULT now | 생성 시각 |

- **Unique 제약**: (storeId, username)

## Entity: Menu

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 메뉴 식별자 |
| name | string | NOT NULL | 메뉴명 |
| price | number | > 0 | 가격 (원) |
| category | string | NOT NULL | 카테고리 |
| description | string \| null | NULL 허용 | 메뉴 설명 |
| imageUrl | string \| null | NULL 허용 | 이미지 URL |
| displayOrder | number | DEFAULT 0 | 노출 순서 |
| isActive | boolean | DEFAULT true | 활성 여부 (Soft Delete) |
| createdAt | Date | DEFAULT now | 생성 시각 |

## Entity: TableSession (테이블 세션)

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 세션 식별자 |
| storeId | string | NOT NULL, FK→users.storeId | 매장 식별자 |
| tableNumber | string | NOT NULL | 테이블 번호 |
| sessionToken | string | NOT NULL, UNIQUE | 자동 로그인 토큰 |
| activatedAt | Date \| null | NULL 허용 | 첫 주문 시각 (세션 시작) |
| createdAt | Date | DEFAULT now | 세션 생성 시각 |
| expiresAt | Date | NOT NULL | 16시간 만료 시각 |
| isActive | boolean | DEFAULT true | 활성 여부 |
| completedAt | Date \| null | NULL 허용 | 이용 완료 시각 |

- **세션 라이프사이클**: 테이블 설정 시 생성(activatedAt=null) → 첫 주문 시 activatedAt 기록 → 이용 완료 시 isActive=false, completedAt 기록

## Entity: Order (주문)

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 주문번호 |
| tableSessionId | number | NOT NULL, FK→table_sessions.id | 테이블 세션 |
| tableNumber | string | NOT NULL | 테이블 번호 (비정규화) |
| status | enum | 'pending'\|'preparing'\|'completed' | 주문 상태 |
| totalAmount | number | >= 0 | 총 주문 금액 |
| createdAt | Date | DEFAULT now | 주문 시각 |
| updatedAt | Date | DEFAULT now | 수정 시각 |

## Entity: OrderItem (주문 항목)

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 항목 식별자 |
| orderId | number | NOT NULL, FK→orders.id, ON DELETE CASCADE | 주문 |
| menuId | number | NOT NULL, FK→menus.id | 메뉴 |
| menuName | string | NOT NULL | 메뉴명 스냅샷 |
| quantity | number | > 0 | 수량 |
| unitPrice | number | >= 0 | 단가 스냅샷 |

- **스냅샷 전략**: 주문 시점의 menuName, unitPrice를 저장하여 메뉴 변경/삭제와 무관하게 주문 내역 보존

## Entity: OrderHistory (과거 주문 내역)

| 속성 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | number | PK, auto-increment | 이력 식별자 |
| orderId | number | NOT NULL | 원본 주문 ID |
| tableSessionId | number | NOT NULL | 테이블 세션 |
| tableNumber | string | NOT NULL | 테이블 번호 |
| status | string | NOT NULL | 최종 상태 |
| totalAmount | number | NOT NULL | 총 금액 |
| itemsSnapshot | JSON | NOT NULL | 주문 항목 스냅샷 |
| createdAt | Date | NOT NULL | 원본 주문 시각 |
| completedAt | Date | NOT NULL | 이용 완료 시각 |
| archivedAt | Date | DEFAULT now | 아카이브 시각 |

---

## ERD (Entity Relationships)

```
User (1) ──< (N) TableSession (1) ──< (N) Order (1) ──< (N) OrderItem (N) >── (1) Menu
                                              │
                                              └──> OrderHistory (이용 완료 시 아카이브)
```

- **User → TableSession**: 1:N (한 매장이 여러 테이블 세션 보유, storeId 기준)
- **TableSession → Order**: 1:N (한 세션에 여러 주문)
- **Order → OrderItem**: 1:N (한 주문에 여러 항목, CASCADE 삭제)
- **Menu → OrderItem**: 1:N (한 메뉴가 여러 주문 항목에 참조, 스냅샷으로 보존)
- **Order → OrderHistory**: 이용 완료 시 아카이브
