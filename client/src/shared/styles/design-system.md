# 테이블오더 디자인 시스템 가이드

모던하고 따뜻한 레스토랑/카페 주문 앱을 위한 디자인 시스템입니다. 고객용(태블릿)과 관리자용(대시보드) 두 컨텍스트를 모두 지원합니다.

- 기술 스택: React + Vite + TypeScript + Tailwind CSS 3.4
- 폰트: Pretendard (한글 최적화), system-ui 폴백
- 접근성: WCAG AA 대비, 최소 44px 터치 타깃, 가시적 포커스, 모션 감소 선호 지원
- 토큰 위치: `client/tailwind.config.js`(테마) + `client/src/index.css`(CSS 변수 & 컴포넌트 클래스)

> **사용 원칙**: 컴포넌트는 가능한 한 시맨틱 클래스(`btn-primary`, `card`, `badge-status-*`)를 사용하세요. 미세 조정이 필요할 때만 Tailwind 유틸리티(`bg-primary-500` 등)를 직접 사용합니다.

---

## 1. 컬러 팔레트

따뜻하고 식욕을 돋우는 음식업종 톤. 모든 색상은 50~950 스케일로 제공되어 `bg-primary-500`, `text-secondary-700` 처럼 직접 사용 가능합니다.

| 토큰 | 역할 | Base (500) | 사용처 |
|------|------|-----------|--------|
| `primary` | 메인 브랜드 (terracotta/red-orange) | `#d65437` | 주요 CTA, 강조, 활성 상태 |
| `secondary` | 리치 브라운 | `#9c6b48` | 헤더, 보조 액션, 안정적 강조 |
| `accent` | 따뜻한 앰버/옐로우 | `#f59e0b` | 신규 배지, 포인트, 하이라이트 |
| `neutral` | warm gray (taupe) | `#928876` | 배경, 텍스트, 보더, 표면 |
| `success` | 성공/완료 | `#22c55e` | 완료 주문, 결제 성공 |
| `warning` | 경고/준비됨 | `#f59e0b` | 준비 완료, 주의 |
| `error` | 오류/취소 | `#ef4444` | 취소, 실패, 위험 액션 |
| `info` | 정보/조리중 | `#14b8a6` | 조리 중, 안내 |

### 컬러 사용 규칙 (60-30-10)
- 60% — `neutral-50`(배경) / `white`(표면)
- 30% — `neutral` 텍스트 및 보더
- 10% — `primary` / `accent` 강조

### 대비 (접근성)
- 본문 텍스트: `text-neutral-900`/`text-neutral-700` on white → AA(4.5:1) 충족
- 버튼 라벨: `primary-500`+흰 텍스트, `accent-500`+`neutral-950` 텍스트(대비 확보)
- 인터랙티브/UI 요소 최소 3:1 유지

---

## 2. 타이포그래피

```
font-family: Pretendard Variable, Pretendard, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
```

태블릿 가독성을 위해 약간 확대된 스케일을 사용합니다.

| 클래스 | 크기 | 용도 |
|--------|------|------|
| `text-5xl` / `text-4xl` | 48 / 36px | 페이지 타이틀, KPI 강조 |
| `text-3xl` | 30px | 통계 값, 섹션 헤더 |
| `text-2xl` / `text-xl` | 24 / 20px | 카드 제목, 가격 |
| `text-lg` / `text-base` | 18 / 16px | 본문, 메뉴명 |
| `text-sm` / `text-xs` | 14 / 12px | 라벨, 캡션, 배지 |

숫자(가격/수량/통계)는 `tabular-nums`로 정렬 안정성 확보.

---

## 3. 스페이싱 & 터치 사이징

| 토큰 | 값 | 용도 |
|------|-----|------|
| `touch` (`min-h-touch`) | 44px | 최소 터치 타깃 (접근성 하한) |
| `touch-lg` | 48px | 기본 버튼 권장 |
| `touch-xl` | 56px | 키오스크/태블릿 주요 CTA |

기본 스페이싱은 Tailwind 표준(4px 그리드) + 확장 토큰(`18`, `88`, `100`, `120`).

---

## 4. 모서리(Radius) & 그림자(Shadow)

- Radius: `rounded`(8px 기본) · `rounded-control`은 인풋/버튼(10px) · `rounded-card`(14px) · `rounded-2xl/3xl`
- Shadow: `shadow-card`(카드 기본) · `shadow-card-hover`(호버) · `shadow-focus`(포커스 링) · `shadow-sm~xl`
- 그림자는 순수 검정 대신 따뜻한 갈색 톤(`rgba(42,38,32,...)`)을 사용해 부드러운 느낌.

---

## 5. 컴포넌트 클래스 (`@layer components`)

### 버튼
```html
<button class="btn-primary">주문하기</button>
<button class="btn-secondary">메뉴 추가</button>
<button class="btn-accent">결제</button>
<button class="btn-outline">취소</button>
<button class="btn-ghost">닫기</button>
<button class="btn-danger">주문 취소</button>

<!-- 사이즈 변형 (조합) -->
<button class="btn-primary btn-sm">작게</button>
<button class="btn-primary btn-lg">크게</button>
<button class="btn-primary btn-xl btn-block">키오스크 CTA (전체 너비)</button>
```
모든 버튼은 최소 44px 높이, 포커스 링, `active:scale` 피드백, disabled 처리 포함.

### 카드
```html
<div class="card">기본 카드</div>
<div class="card-interactive">클릭 가능한 카드 (호버 그림자)</div>

<!-- 메뉴 아이템 (고객용) -->
<article class="menu-card">
  <img src="..." class="aspect-[4/3] object-cover" />
  <div class="menu-card-body">
    <h3 class="card-title">아메리카노</h3>
    <p class="text-neutral-500 line-clamp-2">진한 에스프레소...</p>
    <span class="text-xl font-bold text-primary-600 tabular-nums">4,500원</span>
  </div>
</article>

<!-- KPI 카드 (관리자) -->
<div class="stat-card">
  <span class="stat-card-label">오늘 매출</span>
  <span class="stat-card-value">₩1,240,000</span>
</div>
```

### 배지 / 주문 상태
```html
<span class="badge-primary">인기</span>
<span class="badge-accent">신규</span>

<!-- 주문 상태 (badge-status 변형) -->
<span class="badge-status-new">신규</span>
<span class="badge-status-pending">대기</span>
<span class="badge-status-cooking">조리중</span>
<span class="badge-status-ready">준비완료</span>
<span class="badge-status-served">서빙완료</span>
<span class="badge-status-completed">완료</span>
<span class="badge-status-cancelled">취소</span>
```

### 폼
```html
<label class="label" for="name">이름</label>
<input id="name" class="input" placeholder="입력하세요" />
<p class="form-hint">도움말 텍스트</p>
<p class="form-error">오류 메시지</p>

<textarea class="textarea"></textarea>
<select class="select">...</select>
```

### 수량 조절 (Stepper)
```html
<div class="qty-stepper">
  <button class="qty-btn">−</button>
  <span class="qty-value">2</span>
  <button class="qty-btn">+</button>
</div>
```

### 레이아웃 헬퍼
```html
<div class="app-container">...</div>   <!-- 중앙 정렬 max-width 컨테이너 -->
<section class="page-section">...</section> <!-- fade-in 진입 -->
<div class="divider"></div>
```

### 로딩 스켈레톤
```html
<div class="skeleton h-6 w-32"></div>
```

---

## 6. 애니메이션 (신규 주문 강조 등)

| 클래스 | 효과 | 용도 |
|--------|------|------|
| `animate-pulse-highlight` | 앰버 펄스 링 | 신규 주문 카드 강조 (반복) |
| `animate-flash-bg` | 배경 플래시(1회) | 새 항목 도착 알림 |
| `animate-fade-in` | 페이드 인 | 페이지/콘텐츠 진입 |
| `animate-slide-up` | 아래→위 슬라이드 | 모달, 토스트 |
| `animate-slide-in-right` | 우측 슬라이드 | 사이드 패널, 알림 |
| `animate-scale-in` | 스케일 인 | 팝오버, 드롭다운 |
| `animate-shimmer` | 시머 | 스켈레톤 로딩 |

신규 주문 강조 예시 (관리자 대시보드):
```html
<div class="card order-highlight">
  <span class="badge-status-new">신규</span>
  ...
</div>
```

> 모든 애니메이션은 `prefers-reduced-motion: reduce` 환경에서 자동 비활성화됩니다.

---

## 7. CSS 변수 토큰

`index.css`의 `:root`에 정의된 변수로, 인라인 스타일이나 커스텀 CSS에서 참조 가능합니다. 색상은 `rgb(var(--token))` 형태로 사용하며 알파 조절이 가능합니다.

```css
color: rgb(var(--color-primary));
background: rgb(var(--color-surface));
border: 1px solid rgb(var(--color-border));
color: rgb(var(--color-text-muted));
```

주요 변수: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-success/warning/error/info`, `--radius-card`, `--radius-control`, `--touch-min`.

---

## 8. 컨텍스트별 가이드

### 고객용 (태블릿)
- 큰 터치 타깃(`btn-xl`, `menu-card`), 넉넉한 여백
- 미니멀 메뉴 — 카테고리는 가로 스크롤(`scrollbar-none`)
- `primary`/`accent`로 식욕 자극, 이미지 중심

### 관리자용 (대시보드)
- 정보 밀도 높게: `stat-card`, 상태 배지, 테이블
- 신규 주문 `order-highlight`로 즉시 인지
- 상태 색상 코딩 일관 유지(조리중=info, 완료=success, 취소=error)
