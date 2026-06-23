# 테이블오더 MVP 요구사항 문서

## Intent Analysis Summary

| 항목 | 내용 |
|---|---|
| **User Request** | 테이블오더 플랫폼 MVP 구현 |
| **Request Type** | New Project (기존 스캐폴딩 위에 비즈니스 로직 구현) |
| **Scope Estimate** | Multiple Components (서버, 클라이언트, 데이터베이스) |
| **Complexity Estimate** | Moderate (실시간 통신, 인증, 세션 관리 포함) |

---

## 1. 기능 요구사항 (Functional Requirements)

### 1.1 고객용 기능 (Customer)

#### FR-C01: 테이블 태블릿 자동 로그인 및 세션 관리
- 관리자가 1회 초기 설정 수행 (매장ID, 테이블번호, 테이블비밀번호)
- 로그인 정보 로컬 저장 후 자동 로그인
- 16시간 세션 유지

#### FR-C02: 메뉴 조회 및 탐색
- 메뉴 화면이 기본(메인) 화면
- 카테고리별 메뉴 분류 및 표시
- 메뉴 상세 정보: 메뉴명, 가격, 설명, 이미지
- 카테고리 간 빠른 이동
- 카드 형태 레이아웃, 터치 친화적 버튼 (최소 44x44px)

#### FR-C03: 장바구니 관리
- 메뉴 추가/삭제, 수량 조절 (증가/감소)
- 총 금액 실시간 계산
- 장바구니 비우기
- 로컬 저장 (페이지 새로고침 시에도 유지)
- 서버 전송은 주문 확정 시에만 수행

#### FR-C04: 주문 생성
- 주문 내역 최종 확인 후 주문 확정
- 주문 성공 시: 주문 번호 표시 → 장바구니 비우기 → 5초 후 메뉴 화면 자동 리다이렉트
- 주문 실패 시: 에러 메시지 표시, 장바구니 유지
- 주문 정보: 매장ID, 테이블ID, 메뉴목록(메뉴명, 수량, 단가), 총금액, 세션ID

#### FR-C05: 주문 내역 조회
- 현재 테이블 세션 주문만 표시
- 주문 시간 순 정렬
- 주문별: 주문번호, 주문시각, 메뉴/수량, 금액, 상태(대기중/준비중/완료)
- **주문 상태 SSE 실시간 업데이트** (MVP 포함)
- 매장 이용 완료 처리된 주문은 제외

### 1.2 관리자용 기능 (Admin)

#### FR-A01: 매장 인증
- 매장 식별자 + 사용자명 + 비밀번호 로그인
- JWT 토큰 기반 인증, 16시간 세션 유지
- 브라우저 새로고침 시 세션 유지
- 16시간 후 자동 로그아웃
- 비밀번호 bcrypt 해싱
- **로그인 시도 제한: 5회 실패 시 15분 잠금**

#### FR-A02: 실시간 주문 모니터링
- Server-Sent Events (SSE) 기반 실시간 주문 업데이트
- 그리드/대시보드 레이아웃 (테이블별 카드)
- 각 테이블 카드: 총 주문액, 최신 주문 미리보기
- 주문 카드 클릭 시 전체 메뉴 목록 상세 보기
- 주문 상태 변경 (대기중 → 준비중 → 완료)
- 신규 주문 시각적 강조 (색상 변경, 애니메이션)
- **2초 이내 주문 표시**

#### FR-A03: 테이블 관리
- 테이블 초기 설정 (번호, 비밀번호, 16시간 세션 생성)
- 주문 삭제 (확인 팝업 → 즉시 삭제 → 총 주문액 재계산)
- **테이블 세션 관리: 관리자 수동 '이용 완료' 처리 (자동 만료 없음)**
- 이용 완료 시: 주문 내역 → 과거 이력 이동, 테이블 리셋
- 과거 주문 내역 조회 (시간 역순, 날짜 필터링)

#### FR-A04: 메뉴 관리 (CRUD 전체)
- 메뉴 조회 (카테고리별)
- 메뉴 등록 (메뉴명, 가격, 설명, 카테고리, 이미지URL)
- 메뉴 수정
- 메뉴 삭제
- 메뉴 노출 순서 조정
- 필수 필드 검증, 가격 범위 검증

---

## 2. 비기능 요구사항 (Non-Functional Requirements)

### 2.1 성능
- SSE 기반 실시간 통신: 주문 발생 후 2초 이내 관리자 화면 표시
- 고객 화면 SSE: 주문 상태 변경 시 실시간 반영
- API 응답 시간: 일반 요청 500ms 이내

### 2.2 보안 (Security Extension 적용)
- JWT 토큰 기반 인증 (서버 사이드 검증, 만료/서명 확인)
- 비밀번호 bcrypt 해싱 (adaptive algorithm)
- 로그인 시도 제한: 5회 실패 시 15분 잠금
- 입력값 검증 (Zod 스키마 사용)
- SQL Injection 방지 (Knex parameterized queries)
- CORS 설정 (명시적 origin 허용)
- HTTP Security Headers 적용
- 구조화된 로깅 (민감 정보 제외)

### 2.3 개발 환경
- **Docker Compose**: PostgreSQL 컨테이너 구성
- 모노레포 구조 (npm workspaces)
- TypeScript strict mode

### 2.4 API 설계 표준
- **통일된 응답 래퍼**: `{ success: boolean, data?: T, error?: { code: string, message: string } }`
- **페이지네이션 응답**: `{ success, data, pagination: { page, limit, total } }`
- RESTful API 설계

### 2.5 데이터 무결성
- 테이블 세션: 관리자 수동 '이용 완료' 처리까지 영구 유지
- 트랜잭션 처리: 주문 생성 시 원자적 처리
- 외래키 제약 조건 활용

---

## 3. 기술 스택 (이미 결정됨)

| 구분 | 기술 |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **State Management** | Zustand |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Backend** | Express + TypeScript |
| **Database** | PostgreSQL (Docker Compose) |
| **ORM/Query Builder** | Knex.js |
| **Authentication** | JWT (jsonwebtoken) + bcrypt |
| **Validation** | Zod |
| **Real-time** | Server-Sent Events (SSE) |
| **Testing** | Jest (server), Vitest (client) |

---

## 4. 제외 범위 (Out of Scope)

- 결제 처리 (PG사 연동, 영수증, 환불, 포인트/쿠폰)
- 복잡한 인증 (OAuth, SNS 로그인, 2FA/OTP)
- 파일/이미지 업로드 및 처리
- 알림 시스템 (푸시, SMS, 이메일, 소리/진동)
- 주방 기능 (주방 전달, 재고 관리)
- 분석/리포트 (매출, 데이터 분석)
- 외부 연동 (배달 플랫폼, POS, 소셜미디어)
- 예약, 리뷰, 다국어, 직원 관리

---

## 5. Extension Configuration Summary

| Extension | Enabled | 결정 시점 |
|---|---|---|
| Security Baseline | Yes | Requirements Analysis |
| Resiliency Baseline | No | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |
