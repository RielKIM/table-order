# 테이블오더 디자인 시스템 가이드

> 이 문서는 `client/tailwind.config.js` 와 `client/src/index.css` 에 구현된 디자인 토큰과
> 재사용 유틸리티 클래스의 사용법을 정리한 가이드입니다. 컴포넌트(.tsx)는 여기 정의된
> Tailwind 클래스 / `@layer components` 유틸리티를 `className`으로 채택해 일관된 룩앤필을 적용합니다.
>
> 웹 리서치 결과를 재구성하여 작성했으며, 출처를 인라인으로 인용했습니다. 원문은 30단어 이상
> 연속 인용하지 않고 요약/재구성했습니다. (Content was rephrased for compliance with licensing restrictions.)

---

## 1. 리서치 핵심 인사이트 (2025~2026)

### 모던 레스토랑 / 키오스크 / 테이블오더 UI 트렌드
- **어시 톤 + 단일 강조색**: 따뜻한 뉴트럴(terracotta, clay, taupe, stone)에 하나의 강한 포인트 컬러를
  조합하는 팔레트가 시대를 타지 않으면서 식음료 브랜드의 개성을 살린다는 흐름. ([interaction-design.org](https://www.interaction-design.org/literature/article/ui-color-palette), [envato.com](https://elements.envato.com/learn/color-scheme-trends-in-mobile-app-design))
- **메뉴 단순화**: 카테고리·이미지·폰트를 절제해 결정 피로를 줄이고 빠른 선택을 돕는 미니멀 메뉴가 핵심. ([pickcel.com](https://www.pickcel.com/blog/digital-menu-board-design/))
- **컬러는 장식이 아니라 기능**: 배경/표면/강조 3계층 구조와 명확한 위계가 가독성과 신뢰를 좌우한다. ([interaction-design.org](https://www.interaction-design.org/literature/article/ui-color-palette))

### 태블릿 / 터치 UX 베스트 프랙티스
- **터치 타깃 최소 44×44px**: 애플 가이드 기준. 타깃을 44px → 30px로 줄이면 오탭률이 크게 늘고 완료율이 떨어진다. ([moldstud.com](https://moldstud.com/articles/p-best-practices-for-mobile-user-interaction-designing-for-touch), [siteimprove.com](https://www.siteimprove.com/blog/motor-impairments-and-mobile-ui-the-touch-target-problem))
- **물리적 크기 기준**: 빠르고 정확한 선택을 위해 최소 1cm×1cm 권장. ([nngroup.com](https://www.nngroup.com/articles/touch-target-size/))
- **충분한 간격**: 버튼 사이 여백으로 인접 오탭을 방지. ([designmonks.co](https://www.designmonks.co/blog/perfect-mobile-button-size))

### 관리자 대시보드 / POS 패턴
- **시각적 위계로 빠른 스캔**: 고대비 사이드바 + 밝은 콘텐츠 영역으로 즉각적인 위계를 만든다. ([adminlte.io](https://adminlte.io/blog/best-admin-dashboard-color-schemes/))
- **상태 기반 색상 코딩 + 모션 큐**: 주문 상태를 색으로 구분하고 신규 주문은 pulse/highlight로 강조하면 인지 속도가 빨라진다. 단, 데이터 과부하는 피한다. ([adminlte.io](https://adminlte.io/blog/best-admin-dashboard-color-schemes/))

> 추가 배경 리서치는 `aidlc-docs/construction/design-research.md` 참고.

---

## 2. 색상 팔레트

따뜻하고 식욕을 돋우는 어시 톤을 베이스로, 단일 강조색(앰버)과 상태 색상을 분리했습니다.
모든 색상은 50~950 스케일로 정의되어 `bg-`, `text-`, `border-`, `ring-` 접두사와 함께 사용합니다.

### 브랜드 색상
| 토큰 | base(500) | 의미 | 주요 용도 |
|------|-----------|------|-----------|
| `primary` | `#d65437` (terracotta/red-orange) | 식욕 자극, 브랜드 메인 | 주요 버튼, 활성 탭, 링크 |
| `secondary` | `#9c6b48` (rich brown) | 안정감, 깊이 | 헤더, 보조 버튼, 텍스트 강조 |
| `accent` | `#f59e0b` (warm amber) | 강조, 신규 | CTA, 신규 배지, 하이라이트 |
| `neutral` | warm gray (taupe 베이스) | 무채색(따뜻한) | 배경, 표면, 본문/보조 텍스트, 보더 |

### 시맨틱 색상
| 토큰 | base(500) | 용도 |
|------|-----------|------|
| `success` | `#22c55e` | 성공/완료 메시지 |
| `warning` | `#f59e0b` | 경고 |
| `error` | `#ef4444` | 오류/위험(삭제 등) |
| `info` | `#14b8a6` (teal) | 정보 |

### 주문 상태 색상 (앱 `OrderStatus`와 1:1 매핑)
`status.{pending|preparing|completed}` 그룹으로 정의. 각 그룹은 `50/100/200/500/600/700/fg`를 가집니다.

| 상태 | 색상 계열 | 배경(100) | 텍스트(fg) | 색맹 고려 |
|------|-----------|-----------|------------|-----------|
| `pending` (대기중) | slate gray | `#f1f5f9` | `#334155` | 중립 무채색 — 진행 전 |
| `preparing` (준비중) | warm amber | `#fef3c7` | `#92400e` | 따뜻한 난색 — 진행중 |
| `completed` (완료) | green | `#dcfce7` | `#166534` | 한색 그린 — 마감 |

**색맹(color-blind) 대응 원칙**: 상태를 색상에만 의존해 표현하지 않습니다.
- 색상(hue) + 명도(lightness) + **텍스트 라벨** + **dot 모양**을 항상 함께 제공.
- pending(중립 회색) / preparing(난색 앰버) / completed(한색 그린)은 명도·색상 모두 차이가 커서
  적/녹색맹(deuteranopia/protanopia) 사용자도 구분 가능. 그래도 라벨 텍스트를 반드시 동반합니다.

**WCAG 대비**: 각 상태의 `fg` 색은 해당 `100` 배경 위에서 본문 대비 AA(4.5:1) 수준을 목표로 선정.
인터랙티브 요소/큰 텍스트는 최소 3:1을 충족하도록 설계.

---

## 3. 타이포그래피

- **폰트 패밀리** (`font-sans`, 기본 적용): `Pretendard Variable` → `Pretendard` → 시스템 폰트
  (`-apple-system`, `system-ui`, `Apple SD Gothic Neo`) → `Noto Sans KR` → `Malgun Gothic` → `sans-serif`.
  - 한글 가독성 최적화. Pretendard variable 웹폰트는 `index.css` 상단에서 CDN(jsDelivr)으로 import.
  - 별도 클래스 없이 `body`에 적용되므로 컴포넌트는 폰트 지정 불필요.
- **폰트 사이즈 스케일** (태블릿 가독성을 위해 base 1rem 유지, 상위 스텝 강화):
  `text-xs`(12) · `sm`(14) · `base`(16) · `lg`(18) · `xl`(20) · `2xl`(24) · `3xl`(30) · `4xl`(36) · `5xl`(48).
- **권장 사용**:
  - 본문/메뉴 설명: `text-base` 또는 `text-lg` (태블릿은 18px 이상 권장).
  - 메뉴명/카드 제목: `text-lg`~`text-xl` `font-bold`.
  - 대시보드 KPI 수치: `text-3xl font-extrabold tabular-nums`.
  - 키오스크 화면 헤드라인: `text-4xl`~`text-5xl`.

---

## 4. 레이아웃 토큰

- **터치 사이징** (`spacing`/`minHeight`/`minWidth`):
  `touch`(44px, 최소 타깃) · `touch-lg`(48px, 기본 버튼) · `touch-xl`(56px, 키오스크 CTA).
- **borderRadius**: `rounded-control`(0.625rem, 인풋/버튼) · `rounded-card`(0.875rem, 카드) +
  표준 `sm/md/lg/xl/2xl/3xl`.
- **boxShadow**: `shadow-card` / `shadow-card-hover`(카드 호버) / `shadow-focus`(포커스 링) +
  따뜻한 톤이 섞인 `xs~xl` 스케일.
- **확장 spacing**: `18`(4.5rem) · `88` · `100` · `120` — 넓은 태블릿/대시보드 레이아웃용.

---

## 5. 애니메이션 (신규 주문 강조 등)

| 클래스 | 용도 |
|--------|------|
| `animate-pulse-highlight` | 신규 주문 카드 강조(앰버 펄스 링, 반복) |
| `animate-flash-bg` | 신규 항목 진입 시 배경 플래시(1회) |
| `animate-fade-in` / `animate-slide-up` / `animate-slide-in-right` / `animate-scale-in` | 등장 전환 |
| `animate-shimmer` | 스켈레톤 로딩 |

- 모션 민감 사용자를 위해 `prefers-reduced-motion: reduce` 시 애니메이션이 자동 최소화됩니다(`index.css` base).

---

## 6. 컴포넌트 스타일 가이드 (재사용 유틸리티 클래스)

모든 클래스는 `index.css`의 `@layer components`에 정의되어 표준 Tailwind 클래스와 함께 조합 가능합니다.

### 버튼 (`min-h-touch` 보장 → 44px 이상)
| 클래스 | 설명 |
|--------|------|
| `btn` | 베이스(터치 높이/패딩/포커스/disabled 처리). 단독보다 변형과 함께 사용 |
| `btn-primary` | 메인 액션 (terracotta) |
| `btn-secondary` | 보조 액션 (brown) |
| `btn-accent` | 강조 CTA (amber, 진한 텍스트) |
| `btn-outline` / `btn-ghost` | 라이트/텍스트 버튼 |
| `btn-danger` | 삭제/취소 등 위험 액션 |
| 사이즈: `btn-sm` · `btn-lg` · `btn-xl`(키오스크 CTA 56px) · `btn-block`(전체 너비) |

```tsx
<button className="btn-primary btn-lg">주문하기</button>
<button className="btn-accent btn-xl btn-block">결제하기</button>
```

### 카드
| 클래스 | 설명 |
|--------|------|
| `card` | 기본 카드(흰 배경, 라운드, 카드 그림자, 보더) |
| `card-interactive` | 클릭 가능한 카드(호버 그림자 + active 스케일) |
| `card-header` / `card-title` | 카드 헤더 영역 / 제목 |
| `menu-card` / `menu-card-body` | 고객용 메뉴 아이템 카드(이미지 + 본문) |
| `stat-card` / `stat-card-label` / `stat-card-value` | 관리자 KPI 카드 |

```tsx
<article className="menu-card">
  <img src={img} className="aspect-[4/3] object-cover" />
  <div className="menu-card-body">
    <h3 className="text-lg font-bold">불고기 정식</h3>
    <p className="text-neutral-500 line-clamp-2">{desc}</p>
  </div>
</article>
```

### 주문 상태 배지 / 인디케이터 (색맹 안전: 색 + 라벨 + dot)
앱의 `OrderStatus`(`pending`/`preparing`/`completed`)에 1:1로 매핑된 정식 클래스:

| 클래스 | 상태 |
|--------|------|
| `badge-pending` | 대기중 (slate) |
| `badge-preparing` | 준비중 (amber) |
| `badge-completed` | 완료 (green) |
| `dot-pending` / `dot-preparing` / `dot-completed` | 상태 점 인디케이터 |

```tsx
// StatusBadge 등에서 채택 예시 (색상 + 텍스트 라벨을 함께 노출)
const STATUS_CLASS = {
  pending: 'badge-pending',
  preparing: 'badge-preparing',
  completed: 'badge-completed',
};
<span className={STATUS_CLASS[status]}>
  <span className={DOT_CLASS[status]} /> {STATUS_LABEL[status]}
</span>
```

> 참고: 기존 `badge-status-*`(new/cooking/ready/served 등) 클래스는 더 세분화된 워크플로우용으로
> 유지됩니다. 현재 앱의 3단계 상태에는 위의 `badge-pending/preparing/completed`를 사용하세요.

### 폼 / 수량 조절 / 레이아웃
- 폼: `label` · `input` · `textarea` · `select` · `form-hint` · `form-error` (모두 `min-h-touch`).
- 수량: `qty-stepper` · `qty-btn` · `qty-value` (고객용 장바구니 수량 조절, 터치 타깃 보장).
- 레이아웃: `app-container`(중앙 정렬 컨테이너) · `page-section`(페이드인) · `divider` · `safe-bottom`(노치 대응).
- 강조: `order-highlight`(신규 주문 래퍼, 앰버 링 + pulse) · `skeleton`(로딩).
- 유틸: `line-clamp-2/3`(텍스트 줄임) · `scrollbar-none`(가로 탭 스크롤바 숨김).

---

## 7. 적용 방법 (How to apply)

1. **전역 적용은 자동**: 폰트, 배경/텍스트 색, 포커스 가시성, 스크롤바, 모션 감소는
   `index.css`의 `@layer base`에서 `body`/`html`에 적용되므로 추가 작업이 없습니다.
2. **컴포넌트는 유틸리티 클래스 채택**: 새 색상 hex를 직접 쓰지 말고 토큰 클래스를 사용합니다.
   - ❌ `className="bg-[#d65437]"` → ✅ `className="bg-primary-500"` 또는 `className="btn-primary"`
   - ❌ `bg-yellow-200 text-yellow-900` (상태 배지) → ✅ `badge-preparing`
3. **터치 타깃**: 모든 인터랙티브 요소는 최소 `min-h-touch`(44px). 버튼/인풋 유틸리티는 이미 보장.
4. **고객용(태블릿)**: 큰 버튼(`btn-lg`/`btn-xl`), 카드 레이아웃(`menu-card`), 따뜻한 색감(primary/accent),
   `text-lg` 이상 본문.
5. **관리자용(대시보드)**: 정보 밀도 높은 `stat-card`/테이블, 상태 색상 배지(`badge-pending/preparing/completed`),
   신규 주문은 `order-highlight`로 강조.
6. **기존 클래스 비파괴**: 모든 추가는 `theme.extend`와 `@layer`로만 이루어져 표준 Tailwind 클래스를
   덮어쓰지 않습니다. 기존 컴포넌트는 그대로 동작하며 점진적으로 토큰 클래스로 마이그레이션 가능합니다.

### 점진적 마이그레이션 예시 (StatusBadge)
현재 `StatusBadge.tsx`는 원시 클래스(`bg-gray-200`, `bg-yellow-200`, `bg-green-200`)를 사용합니다.
충돌 방지를 위해 이번 작업에서는 컴포넌트를 수정하지 않았으나, 다음과 같이 교체하면 디자인 시스템에
정렬됩니다(별도 작업 시 적용):

```tsx
const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:   'badge-pending',
  preparing: 'badge-preparing',
  completed: 'badge-completed',
};
```

---

## 8. 변경 요약 (이번 작업)

- `tailwind.config.js`
  - `content` 경로에 `html` 확장자 포함.
  - `colors.status.{pending,preparing,completed}` 그룹 추가 (앱 `OrderStatus`와 매핑, 색맹/대비 고려).
  - 기존 브랜드/시맨틱 색상, 폰트, spacing, radius, shadow, keyframes/animation은 유지.
- `index.css`
  - 상단에 Pretendard variable 웹폰트 CDN import 추가.
  - `:root`에 주문 상태 디자인 토큰(`--status-*`) 추가.
  - `@layer components`에 `badge-pending/preparing/completed`, `dot-pending/preparing/completed` 추가.
- 신규 문서: 본 `design-system.md`.

## 9. 출처

리서치에 참고한 주요 출처(인라인 인용 포함):
[interaction-design.org](https://www.interaction-design.org/literature/article/ui-color-palette) ·
[envato.com](https://elements.envato.com/learn/color-scheme-trends-in-mobile-app-design) ·
[pickcel.com](https://www.pickcel.com/blog/digital-menu-board-design/) ·
[nngroup.com](https://www.nngroup.com/articles/touch-target-size/) ·
[moldstud.com](https://moldstud.com/articles/p-best-practices-for-mobile-user-interaction-designing-for-touch) ·
[siteimprove.com](https://www.siteimprove.com/blog/motor-impairments-and-mobile-ui-the-touch-target-problem) ·
[designmonks.co](https://www.designmonks.co/blog/perfect-mobile-button-size) ·
[adminlte.io](https://adminlte.io/blog/best-admin-dashboard-color-schemes/)

> Content was rephrased for compliance with licensing restrictions.
