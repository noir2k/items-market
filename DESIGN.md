# ITEMMARKET Design Guidelines

> 이 문서는 단순한 디자인 토큰 카탈로그가 아니라 **왜 그렇게 만드는지**에 대한 합의이자, 다음 사람이 이 코드베이스에 손을 댈 때 기준으로 삼아야 하는 룰북이다. UI 결함이 반복적으로 발견되는 이유는 “예쁘게 만들자”는 충동만 있고 *기준*이 없기 때문이다 — 이 문서가 그 기준이다.

목차:
1. [철학과 정체성 (왜 이렇게 만드는가)](#1-철학과-정체성-왜-이렇게-만드는가)
2. [현 상태 진단 (왜 전형적인가)](#2-현-상태-진단-왜-전형적인가)
3. [차별화 방향 (Roadmap)](#3-차별화-방향-roadmap)
4. [디자인 토큰](#4-디자인-토큰)
5. [Spacing Scale](#5-spacing-scale)
6. [Typography](#6-typography)
7. [Color & State Vocabulary](#7-color--state-vocabulary)
8. [Layout Primitives](#8-layout-primitives)
9. [Components](#9-components)
10. [Patterns](#10-patterns)
11. [Motion & Interaction](#11-motion--interaction)
12. [Breakpoints & Density](#12-breakpoints--density)
13. [Accessibility](#13-accessibility)
14. [Visual QA Checklist](#14-visual-qa-checklist)
15. [Anti-patterns (이번 세션에서 발생한 실수 + 처방)](#15-anti-patterns)

---

## 1. 철학과 정체성 (왜 이렇게 만드는가)

### 1.1 사용자 멘탈 모델

게임 아이템 거래소를 찾는 사용자는 크게 4가지 행동을 한다:

| 행동 | 핵심 욕구 | 디자인이 답해야 할 질문 |
|---|---|---|
| **빠르게 둘러본다** | "지금 시세가 어때?" | 한 화면에서 가격·물량·거래 속도가 보이는가 |
| **특정 매물을 찾는다** | "내가 원하는 게 있나?" | 검색·필터가 즉시 작동하는가, 결과가 신뢰되는가 |
| **거래를 건다** | "사기 아닐까?" | 작성자·거래상태·이력이 명확한가 |
| **내 거래를 관리한다** | "내가 등록한 게 어떻게 됐지?" | 내 글의 상태와 다음 액션이 한눈에 보이는가 |

이 4가지 행동을 1초 안에 시작할 수 있게 하는 게 본 디자인의 1차 목표다. **예쁨은 부차적이다.**

### 1.2 디자인 톤

게임 아이템 거래소의 일반적 톤은 두 갈래로 나뉜다:

- **A. "어둡고 화려한" (게임 vibe 직진)** — 검은 배경, 네온 컬러, glow, 무거운 sans-serif
- **B. "밝고 깨끗한" (커머스 신뢰감 직진)** — 흰 배경, 파란/초록 primary, 명료한 정보 위계

ITEMMARKET은 **B를 기본으로 하되, 게임의 정체성을 카테고리/태그/이미지 단계에서 주입한다**. 즉 frame은 커머스 신뢰감, content는 게임 컨텍스트. 이는 다음 이유 때문:

- 아이템 거래는 본질적으로 *돈이 오가는 거래*다. 화려함보다 신뢰가 우선
- 어둡고 화려한 톤은 거래 위험도(사기/탈취 가능성)에 대한 사용자 경계심을 낮출 수 있다
- 한국 사용자는 옥션·당근마켓·번개장터·아이템매니아 등에서 밝은 커머스 톤에 익숙하다

### 1.3 핵심 디자인 원칙 (Hierarchy of Needs)

순서가 중요하다. 위쪽이 위반되면 아래쪽은 의미 없다.

1. **Trust before Beauty** — 작성자, 거래 상태, 가격, 시간이 거짓 없이 보여야 한다. 통계 수치 하나라도 하드코딩되면 그 화면은 거짓말이다.
2. **Density before Drama** — 화면 한 폭에 들어가야 할 정보가 못 들어가서 스크롤을 만들면 안 된다. drop-shadow보다 정보 밀도가 우선.
3. **Consistency before Creativity** — 같은 의미의 요소(예: "거래완료 chip")는 어느 페이지에서도 같은 모양·색·spacing을 가진다. 페이지마다 새로 그리지 않는다.
4. **Korean-first** — 한글이 1차 사용자다. 영문 라벨(`SIGN IN`, `LIVE MARKET` 등 eyebrow)은 보조이고, 본문 라인 높이/자간/wrap 규칙은 한글 기준으로 잡는다.
5. **Readable at 100%** — 줌 0%에서도 본문 글자가 16px 이상, chip text 13px 이상이어야 한다. 게임 거래소 특성상 사용자는 PC와 모바일을 오간다.

---

## 2. 현 상태 진단 (왜 전형적인가)

`/`, `/market`, `/admin` 화면을 보면 다음 특성이 모두 충족된다:

- 흰 배경 + 파란색 CTA + 회색 카드
- pill 모양 chip + button
- 좌측 사이드바 + 우측 컨텐츠
- 영문 eyebrow (`POSTS`, `MEMBERS`) + 한글 헤딩
- card grid, listing grid

이 구성은 **2020년 이후 출시된 거의 모든 한국 커머스 SaaS 대시보드와 동일하다**. Vercel/Supabase 템플릿을 한국어로 옮긴 정도의 차별점밖에 없다. 게임 아이템 거래소만의 시각적 정체성은 0에 수렴.

### 2.1 빠진 요소 (게임 거래소 특화)

| 영역 | 누락 | 영향 |
|---|---|---|
| **게임 식별** | 게임 로고/대표색/아이콘 — 게임 chip이 모두 회색 | 어떤 게임인지 시각만으로 판별 불가 |
| **시세 신호** | 가격 추세, 평균가 대비 위치, 최근 N일 거래량 | 사용자가 가격이 합리적인지 판단 못 함 |
| **거래 신뢰** | 작성자 거래 횟수/평점/응답률, 안전결제 배지 | 사기 우려 ↔ 작성자 신원 비대칭 |
| **실시간성** | 새 글 nudge, "지금 5명이 보고 있어요", 마지막 응답 시간 | 거래소가 *살아있다*는 느낌 부재 |
| **위계** | 모든 글이 같은 카드 모양 — VIP/추천/긴급 매물 구분 없음 | 광고/프로모션 ROI 계량 불가 |
| **카테고리 시각화** | "게임머니/아이템/계정/기타" 텍스트만, 아이콘 없음 | 스캔 속도 저하 |

### 2.2 치명적 결함 (이번 세션에서 발견)

이 코드베이스가 받았던 4가지 UI 사고는 모두 **디자인 시스템 부재**가 근본 원인이다:

1. **`.admin-list__row` grid 누락** — row가 1단으로 stack됨
2. **flex 자식 stretch로 button이 정사각형이 됨** — `border-radius:999px` 가정 깨짐
3. **`.board-toolbar` variant 부재** — admin export form에 3-column grid가 강제 적용
4. **`.panel` 형제 spacing 부재** — row와 list가 붙어버림
5. **row 간 grid track 미공유** — 컬럼 시작점 비정렬

각 결함의 공통점: **컴포넌트 단위로만 보고 시스템 단위로 안 봤다**. 그래서 이 문서가 필요하다.

---

## 3. 차별화 방향 (Roadmap)

빠진 요소를 우선순위로 메우는 단계별 안. 본 문서를 채택하면 다음 PR들이 자연스럽게 따라온다.

### Phase A — Identity (1주)
- 게임별 brand color 토큰 (`--game-maple`, `--game-lostark` 등)
- 게임 chip을 게임색 + 아이콘으로 교체
- 거래 유형(삽니다/팝니다)에 의미 색 부여 (현재 `chip--accent` 외 일관성 없음)

### Phase B — Trust (2주)
- 작성자 row에 "거래 N회", "응답 평균 5분" 같은 신호 추가 (DB 필드 추가 필요)
- 거래 상태 timeline (등록 → 문의 → 거래중 → 거래완료) 시각화
- 안전거래 배지 컴포넌트 정식화

### Phase C — Density (1주)
- 가격 표시에 "평균 대비 -12%" 같은 시세 신호
- 추천 매물에 reason chip ("새 등록", "조회수 급상승")
- 마이페이지를 dashboard 형식으로 (그래프 1-2개)

### Phase D — Realtime (2주)
- "지금 N명이 보는 중" Supabase Realtime 채널
- 새 글 nudge banner
- 댓글 새로 달림 알림

> 이 Roadmap은 본 디자인 가이드 채택 후 별도 plan으로 분리한다.

---

## 4. 디자인 토큰

`app/globals.css :root` 에 정의된 값. **앱 전체에서 raw color/spacing 값 사용 금지** — 반드시 token 경유.

### 4.1 Color (현재)

| Token | 값 | 용도 |
|---|---|---|
| `--bg` | `#f5f7fb` | 페이지 base |
| `--surface` | `#ffffff` | 카드/panel 배경 |
| `--surface-muted` | `#eef2f8` | chip 배경, 보조 영역 |
| `--surface-dark` | `#101828` | dark panel(`panel--dark`) |
| `--line` | `#dbe3ee` | border, divider |
| `--text` | `#1b2430` | 본문 |
| `--muted` | `#667085` | 보조 텍스트, 메타 |
| `--primary` | `#2563eb` | 링크, CTA accent |
| `--primary-soft` | `#e8f0ff` | primary 위 영역, badge 배경 |
| `--accent` | `#0f172a` | dark CTA 배경(`button--dark`) |

### 4.2 추가 필요 (Phase A에서 도입)

```css
:root {
  /* Trade type — 삽니다/팝니다는 행위가 다르므로 다른 색 */
  --trade-buy: #16a34a;        /* 삽니다 = 초록 (구매자 = 수요) */
  --trade-buy-soft: #dcfce7;
  --trade-sell: #2563eb;       /* 팝니다 = 파랑 (현 primary 재사용) */
  --trade-sell-soft: #dbeafe;

  /* Status */
  --status-open: #16a34a;
  --status-closed: #94a3b8;

  /* Game brand colors (대표 6개) */
  --game-maple: #ff9800;
  --game-lineage: #5b21b6;
  --game-fc: #0ea5e9;
  --game-lostark: #b91c1c;
  --game-dnf: #f59e0b;
  --game-aion: #06b6d4;

  /* Risk / Trust */
  --trust-verified: #2563eb;
  --warn: #f59e0b;
  --danger: #dc2626;
}
```

### 4.3 Radius

```css
--radius-sm: 12px;   /* chip, small button */
--radius-md: 18px;   /* card, listing card */
--radius-lg: 28px;   /* panel, hero */
--radius-pill: 999px; /* pill button, chip */
```

### 4.4 Shadow

```css
--shadow: 0 20px 60px rgba(15, 23, 42, 0.08);   /* 카드 */
--shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.06); /* chip hover, button */
--shadow-popup: 0 24px 56px rgba(15, 23, 42, 0.18); /* 모달, dropdown */
```

---

## 5. Spacing Scale

**모든 spacing은 4의 배수**. 임의의 값 (5px, 7px, 11px 등) 금지.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 5.1 사용 규칙

| 영역 | spacing |
|---|---|
| chip 내부 padding | `--space-2 --space-3` |
| button 내부 padding | `0 --space-5` (height min 48px) |
| field gap (label ↔ input) | `--space-2` |
| card 내부 padding | `--space-7` (28px) — `--radius-lg`와 시각적 균형 |
| panel 자식 간 gap | `--space-5` (20px) — 대분류 |
| 같은 그룹 자식 간 gap | `--space-3` (12px) — 소분류 |
| row 내부 gap | `--space-3 --space-6` (수직 12 / 수평 24) |
| section 간 spacing | `--space-12` (48px) |

> ⚠️ `.panel { gap: 18px }`처럼 scale 외 값을 쓰지 않는다. 본 가이드 적용 시 18 → 20으로 정렬.

---

## 6. Typography

### 6.1 Font Stack

- **Body**: `Noto Sans KR` (한글 우선)
- **Display**: `Plus Jakarta Sans` (영문 eyebrow, 숫자 통계)

영문 eyebrow와 한글 본문이 같은 줄에 섞이는 경우 **둘 다 display font 또는 둘 다 body font**로 통일. 절대 라인 안에서 mix 금지.

### 6.2 Type Scale

```css
--text-xs: 0.75rem;    /* 12px — meta, timestamp */
--text-sm: 0.88rem;    /* 14px — chip, secondary */
--text-base: 1rem;     /* 16px — body */
--text-md: 1.125rem;   /* 18px — emphasized body */
--text-lg: 1.32rem;    /* ~21px — h3 */
--text-xl: clamp(1.6rem, 3vw, 2.3rem); /* h2 */
--text-2xl: clamp(2rem, 5vw, 3.5rem);  /* h1 */
```

### 6.3 한글 wrap 규칙

- `word-break: keep-all` 기본 (한글 단어 중간 break 금지)
- 제목은 최대 3줄까지만 (`display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden`)
- chip 텍스트는 `white-space: nowrap` (chip은 절대 줄바꿈 안 함)

### 6.4 숫자 표기

- 가격: `Intl.NumberFormat("ko-KR").format(value)` + "원" → `298,000원`
- 통계 숫자: 같은 방식. `1248` → `1,248`
- 시간: `formatRelativeTime` (분/시간/일 단위, 7일 초과는 절대일자)

---

## 7. Color & State Vocabulary

### 7.1 거래 유형 (Trade Type)

| Type | Color | Chip 클래스 | 라벨 |
|---|---|---|---|
| 팝니다 (sell) | `--trade-sell` | `chip--sell` | "팝니다" |
| 삽니다 (buy) | `--trade-buy` | `chip--buy` (현 `chip--accent` 대체) | "삽니다" |

> ⚠️ 현재 코드의 `chip--accent`는 buy/sell을 한 색으로 처리 — 이 가이드 적용 시 분리.

### 7.2 거래 상태 (Status)

| Status | Color | Chip 클래스 | 라벨 |
|---|---|---|---|
| 거래중 (open) | `--status-open` | `chip--status-open` (`chip` 기본) | "거래중" |
| 거래완료 (closed) | `--status-closed` | `chip--muted` (현존) | "거래완료" |

### 7.3 회원 권한/상태

| Role | 라벨 | 노출 |
|---|---|---|
| admin | "관리자" | 작성자 메타 + admin row |
| member | "일반회원" | 작성자 메타 |

| Status | 라벨 | 색 |
|---|---|---|
| active | "활성" | `--text` 일반 |
| suspended | "정지" | `--danger` |

### 7.4 댓글 타입 (Comment Type)

| Type | 라벨(sell post) | 라벨(buy post) | 시각 |
|---|---|---|---|
| inquiry | "구매문의" | — | `chip--muted` |
| offer | — | "판매제안" | `chip--muted` |
| system | "관리자 안내" | "관리자 안내" | `chip` + admin 강조색 |

---

## 8. Layout Primitives

### 8.1 Container

```css
.container {
  width: min(calc(100% - 32px), var(--container));
  margin: 0 auto;
}
:root { --container: 1180px; }
```

페이지 좌우 여백은 `.container`만 사용. 임의 padding 금지.

### 8.2 Section

```css
.section { padding: var(--space-12) 0; }
.section--soft { background: rgba(232, 240, 255, 0.4); }
.section--compact { padding: var(--space-8) 0; }
```

### 8.3 Panel (카드)

```css
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);          /* 자식 간 spacing 통일 */
  padding: var(--space-7);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
}
```

> ✅ 자식 간 spacing은 panel의 `gap`으로 일괄 처리. 자식이 자기 margin-bottom을 직접 추가하지 않는다 (이 세션의 4번째 사고 처방).

### 8.4 List + Row (subgrid 패턴)

여러 row가 컬럼으로 정렬되어야 하면 **반드시** 부모 grid + 자식 subgrid:

```css
.admin-list {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(160px, 220px) max-content;
  gap: var(--space-3);
}

.admin-list__row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  ...
}
```

> ✅ row마다 `display: grid; grid-template-columns: auto auto auto`로 두면 row끼리 컬럼이 안 맞는다 (이 세션의 5번째 사고 처방). 같은 의미의 컬럼이 row 간에 정렬되어야 하면 **반드시 subgrid**.

### 8.5 Form

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.field--full { grid-column: 1 / -1; }
```

field 라벨 위치는 항상 위, input 아래. `<label class="field"><span>라벨</span><input/></label>` 패턴 고정.

---

## 9. Components

### 9.1 Button

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-pill);
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}
```

**규칙:**
- ✅ flex 부모에 들어갈 때, 부모에 `align-items: center` 또는 `align-items: flex-end` 명시 (이 세션의 2번째 사고 처방)
- ✅ button width는 항상 content + padding으로 결정. `width: 100%`는 `.button--full`만
- ❌ `border-radius: 999px` 상태에서 width ≈ height 되면 정원이 됨 — flex stretch 방지 필수

Variants:
- `.button--dark` — 주 CTA (배경 `--accent`, 텍스트 흰색)
- `.button--light` — 보조 (테두리 `--line`, 배경 흰색)
- `.button--full` — 100% width

### 9.2 Chip

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--surface-muted);
  font-size: var(--text-sm);
  white-space: nowrap;
}
```

Variants:
- `.chip--accent` → **deprecate**. 대신 `.chip--buy` / `.chip--sell` / `.chip--game-{slug}` 사용.
- `.chip--muted` — 종료된 상태

### 9.3 Field

`<label class="field">` 패턴.
- 라벨 항상 위
- input/select height 48px (button과 baseline 정렬)
- 에러 메시지는 input 아래 `--danger` 색

### 9.4 Badge (배지)

거래 글의 trade-type + category를 묶어 표시. 현재 `listing-badges` div + 두 chip — 추후 단일 컴포넌트화.

### 9.5 Listing Card / Market Table

- 그리드 사용 시 위 8.4 subgrid 룰 준수
- 카드 hover 시 `transform: translateY(-2px)` + `--shadow-sm` → `--shadow`
- 카드 안 정보 위계: 제목 → 게임/서버 → 가격 → 메타 (4단)

---

## 10. Patterns

### 10.1 페이지 골격

```
<topbar>      ← 보조 안내 + 1개 링크 (한 줄)
<page-hero>   ← 페이지 정체성 (eyebrow + h1 + 설명)
<section>+    ← 메인 컨텐츠 영역
<footer>      ← 글로벌 footer
```

`page-hero` 안에는 액션 버튼을 넣지 않는다 (전형적인 SaaS 패턴 — 게임 거래소 톤에 안 맞음). 대신 즉시 거래 글 목록이 보이도록 한다.

### 10.2 List 페이지 (거래소, 마이페이지, 관리자)

- 좌측 사이드바: 필터 또는 프로필 (200-280px)
- 우측 메인: 통계 카드 → 헤더 → 필터바 → 리스트
- 리스트는 *항상 subgrid 패턴*

### 10.3 Detail 페이지

- 좌측 (1.35fr): summary + body + comments
- 우측 (0.9fr): seller-card (가격, 작성자, 액션)
- 모바일에서는 우측 → 위, 좌측 → 아래

### 10.4 Form 페이지

- 좌측 (form-panel): 입력
- 우측 (side-info): 가이드/주의사항
- 비로그인 시 form 자리에 "로그인 필요" panel

### 10.5 빈 상태 (Empty State)

```html
<div class="empty-state">
  <strong>아직 등록된 거래 글이 없습니다.</strong>
  <p>판매등록 또는 구매등록 화면에서 첫 게시글을 등록해 주세요.</p>
</div>
```

— 메인 메시지(strong) + 보조 설명(p) + 가능하면 다음 액션 링크. **빈 화면을 그냥 두지 않는다.**

---

## 11. Motion & Interaction

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 320ms;
```

- hover transform: 200ms `--ease-out`
- 페이지 전환: Next.js 기본 사용 (개입 안 함)
- 모달/dropdown: 320ms 등장, 120ms 퇴장
- prefers-reduced-motion: `transform/transition 모두 none`으로 fallback

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 12. Breakpoints & Density

```css
/* mobile-first 가정. min-width 미디어쿼리 사용 */
--bp-sm: 480px;
--bp-md: 720px;
--bp-lg: 960px;
--bp-xl: 1180px;
```

### 12.1 적용 규칙

- < 480px (small phone): 1 column 강제, container padding 12px
- 480-720px (large phone): 1 column, density 유지
- 720-960px (tablet): 2 column 카드 grid
- 960-1180px (small desktop): 사이드바 시작
- 1180+ (desktop): full layout, container max 1180

> ⚠️ 현재 globals.css는 max-width 미디어쿼리를 쓰는데 일관성 부족. 이 가이드 채택 시 점진적으로 min-width 패턴으로 통일.

---

## 13. Accessibility

- **컬러 대비**: 본문 4.5:1, 큰 텍스트 3:1 이상 (WCAG AA)
- **포커스 링**: `:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }` — 모든 interactive 요소
- **키보드 네비**: tab 순서가 시각 순서와 일치. 마우스 hover만으로 노출되는 정보 금지
- **스크린리더**: `aria-label` 사용 (예: 메뉴 토글 버튼, 닫기 버튼). chip group은 `role="group" aria-label`
- **form 에러**: `aria-invalid="true"` + `aria-describedby` 연결
- **국문 lang**: `<html lang="ko">` 고정

---

## 14. Visual QA Checklist

PR 머지 전 또는 핫픽스 후 **반드시** 다음을 한 항목씩 확인. 이번 세션의 4-5개 사고를 막는 최후의 방어선이다.

### 14.1 한 컴포넌트 수정 시
- [ ] 수정한 컴포넌트의 직속 부모 + 형제 1개씩 같이 보기 (단독 X)
- [ ] 같은 클래스를 사용하는 다른 페이지 1곳 점검
- [ ] inspect로 width/height/gap을 형제 N개 동시 측정
- [ ] mobile (375), tablet (720), desktop (1280) 3 viewport에서 확인

### 14.2 List/Row 수정 시 (필수)
- [ ] row N개의 같은 컬럼 자식 width를 측정해서 동일한지 확인
- [ ] row의 max-content 자식이 늘어나도 다른 row가 깨지지 않는지 (긴 텍스트 데이터 추가 후 재확인)
- [ ] 빈 데이터 (0건) 상태 — empty-state가 노출되는지

### 14.3 Form 수정 시
- [ ] 비로그인 상태에서의 fallback panel 노출
- [ ] 잘못된 입력 후 에러 메시지가 form 위에 노출되는지
- [ ] 모바일에서 select/input height가 48px 유지되는지

### 14.4 Color/Theme 수정 시
- [ ] dark variant (`panel--dark`)에 본문이 노출되면 대비 확인
- [ ] hover/focus 상태 색이 정의되어 있는지
- [ ] disabled 상태가 정의되어 있는지

### 14.5 자동화할 것 (Phase B 이후)
- Playwright + percy/chromatic 으로 visual regression
- Storybook + Chromatic 으로 컴포넌트 단위 snapshot
- axe-core로 접근성 자동 검사

---

## 15. Anti-patterns

이 세션에서 실제로 발생한 결함과 처방. **다시는 같은 실수를 반복하지 않기 위한 명시 룰.**

### 15.1 ❌ "row만 grid면 정렬된다" — subgrid 룰 위반

```css
/* WRONG */
.admin-list__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
}
```

각 row가 자기 grid를 가지므로 row마다 컬럼 폭이 다르게 정해져 정렬 깨짐.

```css
/* RIGHT */
.admin-list {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(160px, 220px) max-content;
}
.admin-list__row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

**룰**: 동일한 의미의 자식이 row 간 정렬되어야 하면, 부모 grid + 자식 subgrid 사용.

### 15.2 ❌ "border-radius: 999px만 주면 pill" — flex stretch 무시

```css
/* WRONG */
.admin-filter-actions { display: flex; }   /* align-items 미명시 */
.button { border-radius: 999px; }
/* 부모 grid cell이 height 83px이면 button도 83px → 정원 */
```

```css
/* RIGHT */
.admin-filter-actions {
  display: flex;
  align-items: center;   /* stretch 방지 */
}
```

**룰**: pill button을 담는 모든 flex 컨테이너에 `align-items` 명시. 기본 stretch에 의존 금지.

### 15.3 ❌ "panel은 그냥 div" — 형제 spacing 책임 분산

```css
/* WRONG */
.panel { padding: 28px; }
/* 자식 컴포넌트가 각자 margin-bottom 정의 → 누락 시 빽빽 */
```

```css
/* RIGHT */
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
```

**룰**: 컨테이너 컴포넌트는 자식 간 spacing을 자기 책임으로. 자식이 외부 margin을 가정하지 않게.

### 15.4 ❌ "통계는 일단 적당한 숫자로" — 하드코딩 거짓말

```tsx
/* WRONG */
<strong>1,248</strong> <span>실시간 등록 물품</span>
```

이 화면은 **거짓말**이다. 거래소에서 1번 원칙(Trust)을 가장 직접적으로 위반.

**룰**: 사용자가 보는 모든 숫자는 실제 데이터 또는 명시적 placeholder. placeholder인 경우 시각적으로 구분 (예: dim 처리).

### 15.5 ❌ "Server URL string은 그냥 string action" — typedRoutes 충돌

`<form action="/admin">`을 `next.config.ts: typedRoutes: true`에 넣으면 빌드 실패. 동적 query string redirect도 마찬가지.

**룰**: 동적 redirect/href가 많은 코드베이스에서는 typedRoutes를 끄거나, 모든 redirect URL을 helper로 wrap. 본 프로젝트는 끄는 쪽 선택 (`next.config.ts` 주석 참조).

### 15.6 ❌ "한 컴포넌트만 수정하고 끝" — 시스템 시야 부재

수정 후 그 컴포넌트만 검증하면 안 된다. 같은 클래스를 쓰는 다른 페이지/상태에서 깨질 수 있다.

**룰**: 수정 시 같은 클래스/패턴을 사용하는 다른 곳 최소 1개 추가 점검 (14.1 체크리스트).

---

## 16. 거버넌스

- **이 문서를 수정하려면 PR이 필요하다.** 본 가이드의 룰을 깰 만한 디자인 결정은 여기에 먼저 기록한다.
- **컴포넌트 추가 시 본 문서의 8/9/10 섹션에 패턴 추가**. 코드만 추가하고 문서를 안 갱신하면 다음 사람이 다시 헤맨다.
- **분기마다 14.5 자동화 한 가지씩 도입**. 시각 회귀 테스트가 없으면 본 가이드는 종이일 뿐이다.

---

## 부록 A — 체크리스트 한 장 요약

새 화면을 만들거나 화면을 고칠 때 이 한 장만 보면 된다.

```
[ ] 페이지 골격 = topbar / page-hero / section+ / footer
[ ] container 폭 1180px, 좌우 16px
[ ] 자식 spacing은 panel/section의 gap으로 일괄
[ ] 같은 의미의 row는 부모 grid + subgrid
[ ] flex 부모에 align-items 명시
[ ] 모든 숫자는 실데이터 또는 명시 placeholder
[ ] chip은 nowrap, button height ≥ 48px
[ ] 한글 word-break: keep-all
[ ] 모바일 375 / 태블릿 720 / 데스크탑 1280에서 확인
[ ] 빈 상태(0건)에 empty-state 노출
[ ] 키보드 tab 순서, focus-visible 확인
```
