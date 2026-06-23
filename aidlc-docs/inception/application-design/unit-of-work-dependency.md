# Unit of Work 의존성 매트릭스

## 개요
3개 Unit 간의 의존성과 통신 패턴을 정의합니다.

## 의존성 매트릭스

| Unit \ 의존 | Server API | Customer App | Admin App | PostgreSQL |
|---|---|---|---|---|
| **Server API** | - | ✗ | ✗ | ✓ (직접) |
| **Customer App** | ✓ (HTTP/SSE) | - | ✗ | ✗ |
| **Admin App** | ✓ (HTTP/SSE) | ✗ | - | ✗ |

- ✓: 의존함
- ✗: 의존하지 않음

## 통신 프로토콜

### Customer App → Server API
| 통신 유형 | 프로토콜 | 엔드포인트 |
|---|---|---|
| 인증/세션 | HTTP REST | `/api/tables/*` |
| 메뉴 조회 | HTTP REST | `/api/menus` |
| 주문 생성/조회 | HTTP REST | `/api/orders/*` |
| 주문 상태 실시간 수신 | SSE | `/api/events/orders` |

### Admin App → Server API
| 통신 유형 | 프로토콜 | 엔드포인트 |
|---|---|---|
| 관리자 인증 | HTTP REST | `/api/auth/*` |
| 메뉴 관리 | HTTP REST | `/api/menus` |
| 주문 모니터링/관리 | HTTP REST | `/api/orders/*` |
| 테이블 관리 | HTTP REST | `/api/tables/*` |
| 실시간 주문 수신 | SSE | `/api/events/admin/orders` |

### Server API → PostgreSQL
| 통신 유형 | 프로토콜 |
|---|---|
| 데이터 영속성 | Knex.js (pg driver) |

## 의존성 방향 다이어그램

```
        ┌──────────────┐         ┌──────────────┐
        │ Customer App │         │  Admin App   │
        │ (Port 3001)  │         │ (Port 3002)  │
        └───────┬──────┘         └──────┬───────┘
                │                        │
                │  HTTP REST + SSE       │
                │                        │
                └───────────┬────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   Server API     │
                  │   (Port 3000)    │
                  └─────────┬────────┘
                            │
                            │ Knex.js
                            ▼
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │   (Port 5432)    │
                  └──────────────────┘
```

## Circular Dependency 확인

**결과**: 순환 의존성 없음 ✓

- Server API는 어떤 클라이언트에도 의존하지 않음 (단방향)
- Customer App과 Admin App은 서로 의존하지 않음 (독립)
- 모든 의존성은 클라이언트 → 서버 → DB의 단방향 흐름

## 빌드/배포 순서

Q4(Parallel) 전략에 따라:

1. **Foundation (선행 필수)**: Server API + Database Schema
   - 이유: API 계약과 데이터 모델이 클라이언트 개발의 기반
2. **Parallel (병렬 가능)**: Customer App + Admin App
   - 이유: API 계약 확정 후 두 앱은 서로 독립적으로 개발 가능

## 통합 검증 포인트

| 검증 포인트 | 관련 Unit | 검증 내용 |
|---|---|---|
| API Contract | Server ↔ Customer/Admin | 요청/응답 스키마 일치 |
| SSE Connection | Server ↔ Customer/Admin | 실시간 이벤트 수신 |
| Auth Flow | Server ↔ Admin | JWT 토큰 발급/검증 |
| Order Flow E2E | All Units | 주문 생성 → 관리자 수신 → 상태 변경 → 고객 수신 |
