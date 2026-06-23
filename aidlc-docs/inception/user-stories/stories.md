# User Stories — 테이블오더 MVP

> **분류**: User Journey-Based  
> **Acceptance Criteria**: Given/When/Then (상세)  
> **Granularity**: Fine-grained  
> **Priority**: MoSCoW  

---

## Epic 1: 고객 여정 — 테이블 접근 및 인증

### US-C01: 테이블 태블릿 초기 설정
**As a** 관리자 (박정희)  
**I want to** 태블릿에 매장ID, 테이블번호, 비밀번호를 1회 설정  
**So that** 고객이 별도 로그인 없이 즉시 주문할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 성공적인 초기 설정**
  - Given: 관리자가 태블릿의 초기 설정 화면에 접근한다
  - When: 매장ID, 테이블번호, 비밀번호를 입력하고 저장한다
  - Then: 설정 정보가 로컬에 저장되고, 자동 로그인이 활성화된다

- **Scenario 2: 필수 필드 누락**
  - Given: 관리자가 초기 설정 화면에 접근한다
  - When: 필수 필드(매장ID/테이블번호/비밀번호) 중 하나를 비워둔 채 저장한다
  - Then: 해당 필드에 에러 메시지가 표시되고 저장되지 않는다

- **Scenario 3: 잘못된 매장 정보**
  - Given: 관리자가 초기 설정 화면에 접근한다
  - When: 존재하지 않는 매장ID 또는 잘못된 비밀번호를 입력한다
  - Then: "인증 실패" 에러 메시지가 표시되고 저장되지 않는다

---

### US-C02: 자동 로그인
**As a** 고객 (김민수)  
**I want to** 태블릿을 켜면 자동으로 로그인되어 주문 화면이 보이길  
**So that** 별도의 절차 없이 바로 주문을 시작할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 저장된 정보로 자동 로그인 성공**
  - Given: 초기 설정이 완료된 태블릿이다
  - When: 태블릿에서 웹 앱에 접근한다
  - Then: 저장된 정보로 자동 로그인되어 메뉴 화면이 표시된다

- **Scenario 2: 세션 만료 후 자동 재로그인**
  - Given: 16시간 세션이 만료된 상태이다
  - When: 태블릿에서 웹 앱에 접근한다
  - Then: 저장된 정보로 자동 재로그인되어 메뉴 화면이 표시된다

- **Scenario 3: 저장된 정보 없을 때**
  - Given: 초기 설정이 되지 않은 태블릿이다
  - When: 웹 앱에 접근한다
  - Then: 초기 설정 화면이 표시된다

---

## Epic 2: 고객 여정 — 메뉴 탐색

### US-C03: 카테고리별 메뉴 목록 조회
**As a** 고객 (김민수)  
**I want to** 카테고리별로 분류된 메뉴 목록을 볼 수 있길  
**So that** 원하는 종류의 메뉴를 빠르게 찾을 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 기본 메뉴 화면 표시**
  - Given: 고객이 자동 로그인된 상태이다
  - When: 앱에 접근한다
  - Then: 메뉴 화면이 기본 화면으로 표시되며, 첫 번째 카테고리의 메뉴가 카드 형태로 나열된다

- **Scenario 2: 카테고리 전환**
  - Given: 메뉴 화면이 표시된 상태이다
  - When: 다른 카테고리를 탭한다
  - Then: 해당 카테고리의 메뉴 목록이 즉시 표시된다

- **Scenario 3: 메뉴 카드 정보 표시**
  - Given: 메뉴 목록이 표시된 상태이다
  - When: 각 메뉴 카드를 확인한다
  - Then: 메뉴명, 가격, 이미지가 표시된다

---

### US-C04: 메뉴 상세 정보 조회
**As a** 고객 (김민수)  
**I want to** 메뉴의 상세 설명과 이미지를 확인할 수 있길  
**So that** 주문 전에 메뉴에 대해 충분히 알 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 메뉴 상세 보기**
  - Given: 메뉴 목록이 표시된 상태이다
  - When: 특정 메뉴 카드를 탭한다
  - Then: 메뉴명, 가격, 설명, 이미지가 포함된 상세 정보가 표시된다

- **Scenario 2: 상세에서 장바구니 추가**
  - Given: 메뉴 상세 정보가 표시된 상태이다
  - When: "장바구니 추가" 버튼을 탭한다
  - Then: 해당 메뉴가 수량 1개로 장바구니에 추가된다

---

## Epic 3: 고객 여정 — 장바구니 관리

### US-C05: 장바구니에 메뉴 추가
**As a** 고객 (김민수)  
**I want to** 원하는 메뉴를 장바구니에 담을 수 있길  
**So that** 여러 메뉴를 한 번에 주문할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 메뉴 목록에서 추가**
  - Given: 메뉴 목록 화면이다
  - When: 메뉴 카드의 "추가" 버튼을 탭한다
  - Then: 해당 메뉴가 수량 1개로 장바구니에 추가되고, 장바구니 아이콘에 개수가 표시된다

- **Scenario 2: 이미 있는 메뉴 추가**
  - Given: 장바구니에 "돈까스"가 1개 있다
  - When: "돈까스"를 다시 추가한다
  - Then: 장바구니의 "돈까스" 수량이 2개로 증가한다

---

### US-C06: 장바구니 수량 조절
**As a** 고객 (김민수)  
**I want to** 장바구니에 담긴 메뉴의 수량을 변경할 수 있길  
**So that** 원하는 만큼 주문할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 수량 증가**
  - Given: 장바구니에 "돈까스" 1개가 있다
  - When: "+" 버튼을 탭한다
  - Then: 수량이 2개로 증가하고 총 금액이 재계산된다

- **Scenario 2: 수량 감소**
  - Given: 장바구니에 "돈까스" 2개가 있다
  - When: "-" 버튼을 탭한다
  - Then: 수량이 1개로 감소하고 총 금액이 재계산된다

- **Scenario 3: 수량 1에서 감소**
  - Given: 장바구니에 "돈까스" 1개가 있다
  - When: "-" 버튼을 탭한다
  - Then: 해당 메뉴가 장바구니에서 삭제된다

---

### US-C07: 장바구니 항목 삭제
**As a** 고객 (김민수)  
**I want to** 장바구니에서 특정 메뉴를 제거할 수 있길  
**So that** 마음이 바뀌면 쉽게 수정할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 개별 항목 삭제**
  - Given: 장바구니에 여러 메뉴가 있다
  - When: 특정 메뉴의 "삭제" 버튼을 탭한다
  - Then: 해당 메뉴가 장바구니에서 제거되고 총 금액이 재계산된다

- **Scenario 2: 장바구니 전체 비우기**
  - Given: 장바구니에 여러 메뉴가 있다
  - When: "전체 비우기" 버튼을 탭한다
  - Then: 장바구니가 비워지고 총 금액이 0원으로 표시된다

---

### US-C08: 장바구니 로컬 저장
**As a** 고객 (김민수)  
**I want to** 페이지를 새로고침해도 장바구니가 유지되길  
**So that** 실수로 새로고침해도 담아둔 메뉴가 사라지지 않는다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 새로고침 시 유지**
  - Given: 장바구니에 메뉴 3개가 담겨 있다
  - When: 브라우저를 새로고침한다
  - Then: 장바구니에 동일한 메뉴 3개와 수량, 총 금액이 유지된다

- **Scenario 2: 총 금액 표시**
  - Given: 장바구니에 메뉴가 있다
  - When: 장바구니 화면을 확인한다
  - Then: 각 메뉴의 소계와 전체 총 금액이 실시간으로 표시된다

---

## Epic 4: 고객 여정 — 주문 생성

### US-C09: 주문 확정
**As a** 고객 (김민수)  
**I want to** 장바구니의 메뉴를 최종 확인 후 주문을 확정할 수 있길  
**So that** 실제 주문이 매장에 전달된다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 주문 성공**
  - Given: 장바구니에 메뉴가 있고 주문 확인 화면이 표시된 상태이다
  - When: "주문하기" 버튼을 탭한다
  - Then: 주문이 서버에 전송되고, 주문 번호가 표시되며, 장바구니가 비워진다

- **Scenario 2: 주문 성공 후 자동 리다이렉트**
  - Given: 주문이 성공하여 주문 번호가 표시된 상태이다
  - When: 5초가 경과한다
  - Then: 메뉴 화면으로 자동 리다이렉트된다

- **Scenario 3: 주문 실패**
  - Given: 장바구니에 메뉴가 있다
  - When: 주문을 시도했으나 서버 에러가 발생한다
  - Then: 에러 메시지가 표시되고 장바구니는 그대로 유지된다

- **Scenario 4: 빈 장바구니로 주문 시도**
  - Given: 장바구니가 비어 있다
  - When: 주문 화면에 접근한다
  - Then: "장바구니가 비어 있습니다" 메시지와 함께 주문 버튼이 비활성화된다

---

## Epic 5: 고객 여정 — 주문 내역 확인

### US-C10: 현재 세션 주문 내역 조회
**As a** 고객 (김민수)  
**I want to** 현재 테이블 세션에서 주문한 내역을 확인할 수 있길  
**So that** 무엇을 얼마나 주문했는지 파악할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 주문 내역 목록 표시**
  - Given: 현재 세션에서 주문이 2건 이상 존재한다
  - When: 주문 내역 화면에 접근한다
  - Then: 주문 시간 순으로 정렬된 주문 목록이 표시된다 (주문번호, 시각, 메뉴/수량, 금액, 상태)

- **Scenario 2: 주문 없을 때**
  - Given: 현재 세션에서 주문이 없다
  - When: 주문 내역 화면에 접근한다
  - Then: "주문 내역이 없습니다" 안내 메시지가 표시된다

- **Scenario 3: 이전 세션 주문 미표시**
  - Given: 이전 세션의 주문이 존재하고, 현재 새 세션이 시작되었다
  - When: 주문 내역 화면에 접근한다
  - Then: 현재 세션의 주문만 표시되고, 이전 세션 주문은 보이지 않는다

---

### US-C11: 주문 상태 실시간 업데이트
**As a** 고객 (김민수)  
**I want to** 주문 상태가 변경되면 실시간으로 반영되길  
**So that** 음식이 언제 나올지 파악할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 상태 변경 실시간 반영**
  - Given: 주문 내역 화면에 "대기중" 상태의 주문이 있다
  - When: 관리자가 해당 주문을 "준비중"으로 변경한다
  - Then: 2초 이내에 고객 화면에서 상태가 "준비중"으로 업데이트된다

- **Scenario 2: 완료 상태 반영**
  - Given: "준비중" 상태의 주문이 있다
  - When: 관리자가 "완료"로 변경한다
  - Then: 고객 화면에서 상태가 "완료"로 업데이트된다

---

## Epic 6: 관리자 여정 — 인증

### US-A01: 관리자 로그인
**As a** 관리자 (박정희)  
**I want to** 매장ID, 사용자명, 비밀번호로 로그인할 수 있길  
**So that** 매장 관리 시스템에 안전하게 접근할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 로그인 성공**
  - Given: 유효한 계정 정보를 가진 관리자이다
  - When: 매장ID, 사용자명, 비밀번호를 입력하고 로그인한다
  - Then: JWT 토큰이 발급되고 대시보드 화면으로 이동한다

- **Scenario 2: 잘못된 자격증명**
  - Given: 로그인 화면에 있다
  - When: 잘못된 비밀번호를 입력한다
  - Then: "아이디 또는 비밀번호가 올바르지 않습니다" 에러가 표시된다

- **Scenario 3: 로그인 시도 제한 (5회 초과)**
  - Given: 4회 로그인에 실패한 상태이다
  - When: 5번째 로그인도 실패한다
  - Then: "15분 후 다시 시도해주세요" 메시지가 표시되고 계정이 잠긴다

- **Scenario 4: 잠금 해제**
  - Given: 계정이 잠긴 상태에서 15분이 경과했다
  - When: 로그인을 시도한다
  - Then: 정상적으로 로그인 가능하다

---

### US-A02: 세션 유지 및 자동 로그아웃
**As a** 관리자 (박정희)  
**I want to** 영업 중 로그인이 유지되고 16시간 후 자동 로그아웃되길  
**So that** 편리하면서도 보안이 유지된다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 브라우저 새로고침 시 세션 유지**
  - Given: 로그인된 상태이다
  - When: 브라우저를 새로고침한다
  - Then: 로그인 상태가 유지되고 현재 화면이 표시된다

- **Scenario 2: 16시간 후 자동 로그아웃**
  - Given: 16시간 전에 로그인했다
  - When: API 요청을 보낸다
  - Then: 토큰 만료로 로그인 화면으로 리다이렉트된다

---

## Epic 7: 관리자 여정 — 실시간 주문 모니터링

### US-A03: 테이블별 주문 대시보드
**As a** 관리자 (박정희)  
**I want to** 테이블별 카드 그리드 형태로 현재 주문 현황을 볼 수 있길  
**So that** 매장 전체 상황을 한눈에 파악할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 대시보드 표시**
  - Given: 관리자가 로그인된 상태이다
  - When: 대시보드 화면에 접근한다
  - Then: 테이블별 카드가 그리드 형태로 표시되며, 각 카드에 테이블번호, 총 주문액, 최신 주문 미리보기가 표시된다

- **Scenario 2: 주문 없는 테이블**
  - Given: 대시보드가 표시된 상태이다
  - When: 현재 세션에 주문이 없는 테이블을 확인한다
  - Then: 해당 테이블 카드에 "주문 없음" 또는 빈 상태가 표시된다

---

### US-A04: 신규 주문 실시간 수신
**As a** 관리자 (박정희)  
**I want to** 새 주문이 들어오면 2초 이내에 화면에 표시되길  
**So that** 주문을 즉시 확인하고 처리할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: SSE 실시간 수신**
  - Given: 대시보드가 열려 있고 SSE 연결이 되어 있다
  - When: 고객이 새 주문을 생성한다
  - Then: 2초 이내에 해당 테이블 카드에 신규 주문이 표시된다

- **Scenario 2: 시각적 강조**
  - Given: 신규 주문이 수신되었다
  - When: 해당 테이블 카드가 업데이트된다
  - Then: 색상 변경 또는 애니메이션으로 시각적 강조가 표시된다

---

### US-A05: 주문 상세 보기
**As a** 관리자 (박정희)  
**I want to** 특정 테이블의 전체 주문 내역을 상세히 볼 수 있길  
**So that** 정확한 주문 내용을 확인할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 카드 클릭으로 상세 보기**
  - Given: 대시보드에 테이블 카드가 표시된 상태이다
  - When: 특정 테이블 카드를 클릭한다
  - Then: 해당 테이블의 전체 주문 목록이 상세히 표시된다 (주문번호, 시각, 전체 메뉴 목록, 수량, 금액, 상태)

---

### US-A06: 주문 상태 변경
**As a** 관리자 (박정희)  
**I want to** 주문 상태를 대기중→준비중→완료로 변경할 수 있길  
**So that** 주문 처리 진행을 추적하고 고객에게 알릴 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 상태를 준비중으로 변경**
  - Given: "대기중" 상태의 주문이 있다
  - When: "준비중" 버튼을 클릭한다
  - Then: 상태가 "준비중"으로 변경되고, 고객 화면에도 실시간 반영된다

- **Scenario 2: 상태를 완료로 변경**
  - Given: "준비중" 상태의 주문이 있다
  - When: "완료" 버튼을 클릭한다
  - Then: 상태가 "완료"로 변경되고, 고객 화면에도 실시간 반영된다

---

## Epic 8: 관리자 여정 — 테이블 관리

### US-A07: 주문 삭제 (직권 수정)
**As a** 관리자 (박정희)  
**I want to** 잘못된 주문을 삭제할 수 있길  
**So that** 오주문을 즉시 정정할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 주문 삭제 성공**
  - Given: 특정 테이블에 주문이 있다
  - When: "삭제" 버튼을 클릭하고 확인 팝업에서 "확인"을 선택한다
  - Then: 주문이 삭제되고, 테이블 총 주문액이 재계산된다

- **Scenario 2: 삭제 취소**
  - Given: "삭제" 버튼을 클릭한 상태이다
  - When: 확인 팝업에서 "취소"를 선택한다
  - Then: 주문이 그대로 유지된다

---

### US-A08: 테이블 이용 완료 처리
**As a** 관리자 (박정희)  
**I want to** 고객 퇴장 시 테이블을 '이용 완료' 처리할 수 있길  
**So that** 새 고객이 깨끗한 상태에서 시작할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 이용 완료 성공**
  - Given: 테이블에 현재 세션 주문이 있다
  - When: "이용 완료" 버튼을 클릭하고 확인 팝업에서 "확인"을 선택한다
  - Then: 현재 세션 주문이 과거 이력으로 이동하고, 테이블 주문 목록 및 총 주문액이 0으로 리셋된다

- **Scenario 2: 새 고객 주문 시작**
  - Given: 이용 완료 처리가 된 테이블이다
  - When: 새 고객이 첫 주문을 한다
  - Then: 새로운 세션이 시작되고, 이전 주문 이력은 보이지 않는다

---

### US-A09: 과거 주문 내역 조회
**As a** 관리자 (박정희)  
**I want to** 테이블별 과거 주문 내역을 조회할 수 있길  
**So that** 이전 이용 내역을 확인할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 과거 내역 목록 표시**
  - Given: 테이블에 과거 주문 내역이 있다
  - When: "과거 내역" 버튼을 클릭한다
  - Then: 시간 역순으로 과거 주문 목록이 표시된다 (주문번호, 시각, 메뉴목록, 총금액, 이용완료 시각)

- **Scenario 2: 날짜 필터링**
  - Given: 과거 내역이 표시된 상태이다
  - When: 특정 날짜를 선택한다
  - Then: 해당 날짜의 주문만 필터링되어 표시된다

- **Scenario 3: 대시보드 복귀**
  - Given: 과거 내역 화면이 표시된 상태이다
  - When: "닫기" 버튼을 클릭한다
  - Then: 대시보드 화면으로 복귀한다

---

## Epic 9: 관리자 여정 — 메뉴 관리

### US-A10: 메뉴 목록 조회
**As a** 관리자 (박정희)  
**I want to** 등록된 메뉴를 카테고리별로 조회할 수 있길  
**So that** 현재 메뉴 구성을 확인할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 카테고리별 조회**
  - Given: 관리자가 메뉴 관리 화면에 접근한다
  - When: 특정 카테고리를 선택한다
  - Then: 해당 카테고리의 메뉴 목록이 노출 순서대로 표시된다

---

### US-A11: 메뉴 등록
**As a** 관리자 (박정희)  
**I want to** 새 메뉴를 등록할 수 있길  
**So that** 매장 메뉴를 추가할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 등록 성공**
  - Given: 메뉴 등록 폼이 표시된 상태이다
  - When: 메뉴명, 가격, 설명, 카테고리, 이미지URL을 입력하고 저장한다
  - Then: 메뉴가 등록되고 메뉴 목록에 표시된다

- **Scenario 2: 필수 필드 누락**
  - Given: 메뉴 등록 폼이 표시된 상태이다
  - When: 메뉴명 또는 가격을 비워둔 채 저장한다
  - Then: 필수 필드 에러 메시지가 표시되고 저장되지 않는다

- **Scenario 3: 가격 범위 검증**
  - Given: 메뉴 등록 폼이 표시된 상태이다
  - When: 가격에 음수 또는 0을 입력한다
  - Then: 가격 범위 에러 메시지가 표시되고 저장되지 않는다

---

### US-A12: 메뉴 수정
**As a** 관리자 (박정희)  
**I want to** 기존 메뉴 정보를 수정할 수 있길  
**So that** 가격 변경이나 설명 업데이트를 할 수 있다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 수정 성공**
  - Given: 기존 메뉴의 수정 폼이 표시된 상태이다
  - When: 가격을 변경하고 저장한다
  - Then: 메뉴 정보가 업데이트되고, 고객 메뉴 화면에도 반영된다

---

### US-A13: 메뉴 삭제
**As a** 관리자 (박정희)  
**I want to** 더 이상 판매하지 않는 메뉴를 삭제할 수 있길  
**So that** 고객에게 비활성 메뉴가 보이지 않는다  

**Priority**: Must Have

**Acceptance Criteria**:

- **Scenario 1: 삭제 성공**
  - Given: 메뉴 목록에서 특정 메뉴를 선택한 상태이다
  - When: "삭제" 버튼을 클릭하고 확인한다
  - Then: 메뉴가 삭제되고 고객 화면에서 더 이상 표시되지 않는다

---

### US-A14: 메뉴 노출 순서 조정
**As a** 관리자 (박정희)  
**I want to** 메뉴의 표시 순서를 변경할 수 있길  
**So that** 인기 메뉴나 추천 메뉴를 상단에 배치할 수 있다  

**Priority**: Should Have

**Acceptance Criteria**:

- **Scenario 1: 순서 변경**
  - Given: 카테고리에 여러 메뉴가 있다
  - When: 메뉴의 순서를 변경하고 저장한다
  - Then: 변경된 순서가 저장되어 고객 메뉴 화면에 반영된다

---

---

## Story Summary

| Epic | Stories | Priority |
|---|---|---|
| Epic 1: 테이블 접근 및 인증 | US-C01, US-C02 | Must Have |
| Epic 2: 메뉴 탐색 | US-C03, US-C04 | Must Have |
| Epic 3: 장바구니 관리 | US-C05~US-C08 | Must Have |
| Epic 4: 주문 생성 | US-C09 | Must Have |
| Epic 5: 주문 내역 확인 | US-C10, US-C11 | Must Have |
| Epic 6: 관리자 인증 | US-A01, US-A02 | Must Have |
| Epic 7: 실시간 주문 모니터링 | US-A03~US-A06 | Must Have |
| Epic 8: 테이블 관리 | US-A07~US-A09 | Must Have |
| Epic 9: 메뉴 관리 | US-A10~US-A14 | Must(10-13), Should(14) |

**Total**: 25 User Stories (24 Must Have, 1 Should Have)

## Persona-Story Mapping

| Persona | Stories |
|---|---|
| 고객 (김민수) | US-C01~US-C11 (11 stories) |
| 관리자 (박정희) | US-C01, US-A01~US-A14 (15 stories) |

## INVEST Criteria Verification
- **Independent**: 각 스토리는 독립적으로 구현 및 배포 가능
- **Negotiable**: 구현 세부사항은 협상 가능
- **Valuable**: 각 스토리가 고객 또는 관리자에게 직접적 가치 제공
- **Estimable**: Fine-grained 단위로 추정 가능
- **Small**: 개별 기능 단위로 충분히 작음
- **Testable**: Given/When/Then으로 테스트 가능한 기준 명시

## Requirements Coverage
- FR-C01 → US-C01, US-C02
- FR-C02 → US-C03, US-C04
- FR-C03 → US-C05, US-C06, US-C07, US-C08
- FR-C04 → US-C09
- FR-C05 → US-C10, US-C11
- FR-A01 → US-A01, US-A02
- FR-A02 → US-A03, US-A04, US-A05, US-A06
- FR-A03 → US-A07, US-A08, US-A09
- FR-A04 → US-A10, US-A11, US-A12, US-A13, US-A14
