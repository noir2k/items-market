# Phase A — Design Tokens & System Adoption

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to run task-by-task with browser regression after each. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DESIGN.md의 토큰/룰을 실제 코드(`app/globals.css`, components, lib)에 반영해 향후 디자인 사고를 차단할 수 있는 토대를 만든다.

**Architecture:** 5단계 — ① 토큰 추가(시각 변경 0) → ② 기존 raw 값을 토큰으로 교체(시각 변경 0) → ③ trade type 색 분리(buy=초록, sell=파랑) → ④ game brand color chip(게임별 색·아이콘) → ⑤ a11y/wrap/motion 룰 적용.

**Tech Stack:** CSS Custom Properties, Next.js 16, React 19. 컴포넌트 변경 최소화.

---

## Task A.1 — :root에 토큰 추가

**Files:** `app/globals.css`

- [ ] **Step 1: spacing scale 추가**

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

- [ ] **Step 2: trade/status/game/risk 색 토큰 추가**

```css
:root {
  /* Trade type */
  --trade-buy: #16a34a;
  --trade-buy-soft: #dcfce7;
  --trade-sell: #2563eb;
  --trade-sell-soft: #dbeafe;

  /* Status */
  --status-open: #16a34a;
  --status-closed: #94a3b8;

  /* Game brand colors */
  --game-maple: #ff9800;
  --game-lineage: #5b21b6;
  --game-fc: #0ea5e9;
  --game-lostark: #b91c1c;
  --game-dnf: #f59e0b;
  --game-aion: #06b6d4;

  /* Risk / Trust */
  --warn: #f59e0b;
  --danger: #dc2626;
  --trust-verified: #2563eb;
}
```

- [ ] **Step 3: radius/shadow/motion/breakpoint 토큰 보강**

```css
:root {
  --radius-pill: 999px;
  --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.06);
  --shadow-popup: 0 24px 56px rgba(15, 23, 42, 0.18);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;

  --bp-sm: 480px;
  --bp-md: 720px;
  --bp-lg: 960px;
  --bp-xl: 1180px;
}
```

- [ ] **Step 4: dev server에서 한 번 reload — 시각 변화 0 확인 (토큰 추가만 했으므로)**

- [ ] **Step 5: 커밋**

```bash
git add app/globals.css
git commit -m "feat(tokens): add spacing/color/motion scales per DESIGN.md"
```

---

## Task A.2 — 기존 raw 값을 토큰으로 교체 (시각 변경 0)

**Files:** `app/globals.css`

대상: `padding`, `gap`, `margin`, `border-radius`, `box-shadow`, `transition` 의 raw 픽셀/색 값을 토큰으로 치환. **계산값은 토큰 값과 동일해야 한다 (시각 변경 0).**

- [ ] **Step 1: padding/gap raw 값을 spacing 토큰으로 치환**

찾기-치환 매핑 (raw → token):
- `4px` → `var(--space-1)`
- `8px` → `var(--space-2)`
- `10px` → `var(--space-2)` 또는 `var(--space-3)` (문맥에 따라; pill button gap)
- `12px` → `var(--space-3)`
- `14px` → `var(--space-3)` (gap 14는 12로 정렬)
- `16px` → `var(--space-4)`
- `18px` → `var(--space-5)` (panel gap, 20으로 정렬)
- `20px` → `var(--space-5)`
- `22px` → `var(--space-5)` 또는 `var(--space-6)`
- `24px` → `var(--space-6)`
- `28px` → `var(--space-7)`
- `32px` → `var(--space-8)`
- `48px` → `var(--space-12)`

⚠️ 컴포넌트 size에 영향을 미치는 padding(`button` 의 `min-height: 48px` 등)은 그대로 둔다.

- [ ] **Step 2: shadow를 --shadow / --shadow-sm 토큰으로 치환**

`box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16)` 같은 raw shadow는 그대로 둔다 — 의도적 디자인 효과. 단, 카드 일반 shadow는 `var(--shadow)`로 치환.

- [ ] **Step 3: 시각 회귀 — admin/market/home 3페이지 스크린샷 비교**

dev server에서 비교. 차이 없는지 확인 (수치 토큰화는 시각 변화 0이어야 함).

- [ ] **Step 4: 커밋**

```bash
git commit -m "refactor(css): replace raw spacing values with design tokens"
```

---

## Task A.3 — Trade type 색 분리 (buy = 초록, sell = 파랑)

**Files:** `app/globals.css`, `components/MarketTable.tsx`, `components/ListingGrid.tsx`, `app/market/[id]/page.tsx`

- [ ] **Step 1: chip variant 추가**

```css
.chip--buy {
  background: var(--trade-buy-soft);
  color: var(--trade-buy);
  font-weight: 600;
}

.chip--sell {
  background: var(--trade-sell-soft);
  color: var(--trade-sell);
  font-weight: 600;
}

/* Status */
.chip--status-open {
  background: rgba(22, 163, 74, 0.12);
  color: var(--status-open);
  font-weight: 600;
}

.chip--status-closed {
  background: var(--surface-muted);
  color: var(--status-closed);
}
```

- [ ] **Step 2: `chip--accent` 사용처를 trade type별로 분리**

검색: `chip--accent`. 모두 trade type 기반이므로:

```tsx
// before
<span className={`chip ${item.tradeType === "buy" ? "chip--accent" : ""}`}>
  {getTradeTypeLabel(item.tradeType)}
</span>

// after
<span className={`chip chip--${item.tradeType}`}>
  {getTradeTypeLabel(item.tradeType)}
</span>
```

대상 파일:
- `components/MarketTable.tsx`
- `components/ListingGrid.tsx`
- `app/market/[id]/page.tsx`
- `components/MarketBoard.tsx` (필요시)

- [ ] **Step 3: status chip도 같은 패턴**

```tsx
// before
<span className={`chip ${item.status === "closed" ? "chip--muted" : ""}`}>
  {getStatusLabel(item.status)}
</span>

// after
<span className={`chip chip--status-${item.status}`}>
  {getStatusLabel(item.status)}
</span>
```

- [ ] **Step 4: 브라우저 회귀**

`/market`에서 buy(초록) / sell(파랑) chip 시각 분리 확인. `/admin` 게시글 row도 동일.

- [ ] **Step 5: 단위 테스트 — chip class 명명 규칙**

(기존 테스트가 있다면 갱신, 없으면 skip)

- [ ] **Step 6: 커밋**

```bash
git commit -m "feat(chip): split trade-type chip colors (buy=green, sell=blue) and status chips"
```

---

## Task A.4 — Game brand color chip

**Files:** `app/globals.css`, `lib/market-utils.ts` (또는 별도 helper), `components/MarketTable.tsx`, `components/ListingGrid.tsx`

- [ ] **Step 1: game chip 클래스 추가**

```css
.chip--game-maplestory   { background: rgba(255, 152, 0, 0.16);  color: var(--game-maple); }
.chip--game-lineagem     { background: rgba(91, 33, 182, 0.16);  color: var(--game-lineage); }
.chip--game-fc-online    { background: rgba(14, 165, 233, 0.16); color: var(--game-fc); }
.chip--game-lostark      { background: rgba(185, 28, 28, 0.16);  color: var(--game-lostark); }
.chip--game-dnf          { background: rgba(245, 158, 11, 0.16); color: var(--game-dnf); }
.chip--game-aion         { background: rgba(6, 182, 212, 0.16);  color: var(--game-aion); }
```

- [ ] **Step 2: lib에 game slug → chip class 매핑 헬퍼**

```ts
// lib/market-utils.ts
export function getGameChipClass(slug: string | null | undefined): string {
  if (!slug) return "";
  return `chip--game-${slug}`;
}
```

- [ ] **Step 3: 사용처에서 적용**

`components/MarketTable.tsx`, `ListingGrid.tsx` 의 game 표시 부분을 chip으로 변경:

```tsx
<span className={`chip ${getGameChipClass(item.gameSlug)}`}>{item.game}</span>
```

또는 기존 메타라인을 유지하면서 game name만 색칠:

```tsx
<div className="market-table__meta">
  <span className={`game-tag ${getGameChipClass(item.gameSlug)}`}>{item.game}</span>
  · {item.server} · {item.category} · {item.quantity}
</div>
```

선택은 시각 검증 후 결정.

- [ ] **Step 4: 단위 테스트**

```ts
// tests/lib/market-utils.test.ts
it("maps game slug to chip class", () => {
  expect(getGameChipClass("maplestory")).toBe("chip--game-maplestory");
  expect(getGameChipClass(null)).toBe("");
});
```

- [ ] **Step 5: 브라우저 회귀**

`/market`에서 메이플스토리(주황) / 로스트아크(빨강) / FC Online(하늘) chip이 게임별 색으로 노출되는지 확인.

- [ ] **Step 6: 커밋**

```bash
git commit -m "feat(chip): apply game brand colors to game chips"
```

---

## Task A.5 — A11y / wrap / motion 룰 적용

**Files:** `app/globals.css`

- [ ] **Step 1: 한글 wrap 룰**

```css
body {
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

- [ ] **Step 2: focus-visible 표준 outline**

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 3: prefers-reduced-motion fallback**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 4: chip nowrap 강제**

```css
.chip {
  white-space: nowrap;
}
```

(이미 적용된 경우 noop)

- [ ] **Step 5: 브라우저 회귀**

키보드 Tab으로 페이지 순회 시 focus ring이 보이는지, 한글 단어가 중간에 안 끊기는지 확인.

- [ ] **Step 6: 커밋**

```bash
git commit -m "chore(a11y): keep-all word-break, focus-visible outline, reduce-motion fallback"
```

---

## Task A.6 — 빌드 + 회귀 + push

- [ ] **Step 1: 빌드**

```bash
npm run build
```

- [ ] **Step 2: 단위 테스트**

```bash
npm test
```

- [ ] **Step 3: production server에서 회귀**

`/`, `/market`, `/admin` 3페이지 스크린샷.

- [ ] **Step 4: push**

```bash
git push origin main
```

---

## 자기 점검

- [x] Spec coverage: DESIGN.md의 토큰/룰을 모두 task로 분해함
- [x] Placeholder scan: 모든 step에 코드 블록 명시
- [x] Type consistency: `getGameChipClass(slug)` 시그니처 일관, `chip--game-{slug}` 명명 규칙 일관
