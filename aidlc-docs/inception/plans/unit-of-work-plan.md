# Unit of Work Plan - 테이블오더 MVP

## 개요
테이블오더 시스템을 개발 가능한 작업 단위로 분해하는 계획입니다.

---

## Decomposition Questions

### Question 1
작업 단위 분해 기준은 어떻게 하시겠습니까?

A) Deployment Unit 기준 — 독립 배포 가능한 서비스 단위 (예: 서버 API, 고객 앱, 관리자 앱)

B) Feature/Domain 기준 — 도메인 기능 단위 (예: 인증 도메인, 주문 도메인, 메뉴 도메인)

C) Development Team 기준 — 개발 팀 담당 단위

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
공유 코드(shared)와 도메인 코드의 경계를 어떻게 하시겠습니까?

A) Strict — shared에는 순수 유틸리티만, 도메인 로직은 각 단위 내부

B) Flexible — shared에 도메인 공통 모델 포함 (User, Order 등)

C) Hybrid — TypeScript types는 shared, 구현은 각 단위

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
데이터베이스 접근 전략은 어떻게 하시겠습니까?

A) Shared Database — 모든 단위가 동일한 PostgreSQL 데이터베이스 접근

B) Database per Unit — 각 단위별 독립 데이터베이스/스키마

C) API Gateway — 모든 데이터 접근은 서버 API를 통해

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
개발 진행 순서는 어떻게 하시겠습니까?

A) Sequential — 백엔드 → 프론트엔드 순차 개발

B) Parallel — 백엔드와 프론트엔드 병렬 개발 (API 계약 정의 후)

C) Vertical Slices — 하나의 기능 완전히 (API + UI) 개발 후 다음 기능

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Unit of Work Steps (승인 후 실행)

### Phase 1: Unit Boundary 정의
- [x] 각 Unit의 목적 및 책임 정의
- [x] Unit 간 명확한 경계 설정
- [x] 공유 컴포넌트 식별

### Phase 2: Dependency 분석
- [x] Unit 간 의존성 매트릭스 생성
- [x] 통신 프로토콜 및 데이터 흐름 정의
- [x] Circular dependency 확인

### Phase 3: Story Mapping
- [x] User Stories → Units 매핑
- [x] 각 Unit의 구현 범위 정의
- [x] 우선순위 기반 구현 순서 정의

### Phase 4: Development Strategy
- [x] 개발 및 테스트 전략 수립
- [x] 통합 포인트 정의
- [x] 배포 및 운영 전략

---

## Mandatory Artifacts
- `aidlc-docs/inception/application-design/unit-of-work.md`
- `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
