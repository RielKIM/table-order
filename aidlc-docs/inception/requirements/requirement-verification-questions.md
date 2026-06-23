# 요구사항 검증 질문

기존 요구사항 문서(`requirements/table-order-requirements.md`)를 분석한 결과, 아래 질문들에 대한 답변이 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션 알파벳을 입력해 주세요.

---

## Question 1
MVP 개발 범위에서 메뉴 관리(CRUD) 기능은 관리자용 필수 기능에 명시되지 않았습니다. 메뉴 관리 기능을 MVP에 포함하시겠습니까?

A) 예 — 메뉴 CRUD(조회/등록/수정/삭제) 전체 포함

B) 부분 포함 — 메뉴 조회와 등록만 포함 (수정/삭제는 이후)

C) 아니오 — MVP에서 제외 (시드 데이터로 메뉴를 미리 넣어두고 사용)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
주문 상태 실시간 업데이트(고객 화면)는 요구사항에 "선택사항"으로 표기되어 있습니다. MVP에 포함하시겠습니까?

A) 예 — 고객 화면에서도 SSE로 주문 상태 실시간 업데이트

B) 아니오 — 고객 화면은 수동 새로고침 또는 페이지 재방문 시 업데이트

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
데이터베이스 초기 설정과 관련하여, 개발 환경에서의 데이터베이스 구성 방식을 어떻게 하시겠습니까?

A) Docker Compose로 PostgreSQL 컨테이너 구성 (권장 — 팀 간 일관된 환경)

B) 로컬 PostgreSQL 직접 설치 사용

C) 클라우드 데이터베이스 사용 (AWS RDS 등)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
API 응답 형식에 대한 표준이 필요합니다. 어떤 형태를 선호하시나요?

A) 통일된 응답 래퍼 사용 — `{ success: boolean, data?: T, error?: { code: string, message: string } }`

B) HTTP 상태 코드 기반 — 성공 시 데이터만 반환, 에러 시 에러 객체 반환

C) 위 A안을 기본으로 하되, 페이지네이션 응답에는 `{ success, data, pagination: { page, limit, total } }` 추가

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
관리자 로그인 시도 제한(보안 요구사항)의 구체적인 수치를 정해야 합니다.

A) 5회 실패 시 15분 잠금

B) 10회 실패 시 30분 잠금

C) 3회 실패 시 5분 잠금

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6
테이블 세션의 자동 만료 정책이 필요합니다. 테이블 세션은 관리자가 수동으로 '이용 완료' 처리하지 않으면 영구 유지됩니까?

A) 영구 유지 — 관리자가 수동으로 '이용 완료' 처리할 때까지 세션 유지

B) 자동 만료 — 마지막 주문 후 일정 시간(예: 4시간) 경과 시 자동 종료

C) 영업 시간 기반 — 매일 지정 시간(예: 새벽 4시)에 모든 세션 자동 종료

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) 예 — 모든 SECURITY 규칙을 blocking 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)

B) 아니오 — SECURITY 규칙 건너뜀 (PoC, 프로토타입, 실험적 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: Resiliency Extensions
이 프로젝트에 복원력(Resiliency) 베이스라인을 적용하시겠습니까?

**이 확장이란**: AWS Well-Architected Framework (신뢰성 Pillar) 기반의 설계 시점 모범 사례를 적용하여 내결함성, 고가용성, 관측성, 복구 가능성을 향한 요구사항/설계/코드를 안내합니다.

**이 확장이 아닌 것**: 프로덕션 준비 완료를 보장하거나 가용성/RTO/RPO 목표를 인증하지 않습니다. 좋은 복원력 결정을 초기에 scaffold하는 **시작점**입니다.

A) 예 — 복원력 베이스라인을 방향적 모범 사례 및 설계 시점 가이드로 적용 (비즈니스 크리티컬 워크로드에 권장)

B) 아니오 — 복원력 베이스라인 건너뜀 (PoC, 프로토타입, 실험적 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 9: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing (PBT) 규칙을 적용하시겠습니까?

A) 예 — 모든 PBT 규칙을 blocking 제약으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, stateful 컴포넌트가 있는 프로젝트에 권장)

B) 부분 적용 — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용 (알고리즘 복잡도가 제한적인 프로젝트에 적합)

C) 아니오 — PBT 규칙 건너뜀 (단순 CRUD, UI 전용, 비즈니스 로직이 거의 없는 통합 레이어에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---
