# Market Navigation Refactor — Hub + Sub-nav

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** `/market`을 "게임 허브"로 재정의하고, 게시판은 `/market/game/[slug]`에 집중. 좌측 게임 사이드바를 가로형 sub-nav로 전환해 게임이 늘어나도 UI가 무너지지 않게 한다.

**문제 진단 (사용자 피드백):**
- `/market`이 모든 게임 모든 글을 한 화면에 보여줌 → 정보 과잉, 무엇을 봐야 할지 불분명
- 좌측 사이드바 게임 list가 게임 늘면 길이 폭주 → 모바일/태블릿에서 더 심각
- 게시판이 본 콘텐츠인데 좌측 nav에 폭을 빼앗김 (board-shell이 270px sidebar + main)

**리팩토링 방향:**
1. `/market` = **게임 허브** (게임 카드 그리드, 글 목록 없음)
2. `/market/game/[slug]` = **실제 게시판** (사이드바 제거, 가로형 sub-nav 추가, 메인 폭 100% 활용)
3. nav "거래소" → 허브로 이동. 거래소 외 추가 nav 항목 안 만듦 (게임 N개 늘어도 nav 깨끗 유지)

**Tech Stack:** 기존 component 재사용. 신규 컴포넌트 2개 (`GameHubCard`, `GameSubNav`).

---

## Task M.1 — 게임 통계 데이터 모델

**목표:** 각 게임별 (전체/거래중/팝니다/삽니다) 카운트를 server-side에서 fetch.

**Files:**
- Modify: `lib/market-server.ts`
- Modify: `lib/types.ts`

### Steps

- [ ] **Step 1: types에 `GameBoardStat` 추가**

```ts
// lib/types.ts
export interface GameBoardStat {
  game: MarketGameOption;
  totalPosts: number;
  openPosts: number;
  sellPosts: number;
  buyPosts: number;
}
```

- [ ] **Step 2: server fetcher**

```ts
// lib/market-server.ts
export async function listGameBoardStats(): Promise<GameBoardStat[]> {
  const supabase = await createClient();
  const [gamesResult, postsResult] = await Promise.all([
    supabase
      .from("games")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("market_posts")
      .select("game_id, status, trade_type")
  ]);

  if (gamesResult.error || postsResult.error) {
    return [];
  }

  const games = (gamesResult.data ?? []) as MarketGameOption[];
  const posts = (postsResult.data ?? []) as Array<{ game_id: number; status: MarketStatus; trade_type: TradeType }>;

  return games.map((game) => {
    const gamePosts = posts.filter((p) => p.game_id === game.id);
    return {
      buyPosts: gamePosts.filter((p) => p.trade_type === "buy").length,
      game,
      openPosts: gamePosts.filter((p) => p.status === "open").length,
      sellPosts: gamePosts.filter((p) => p.trade_type === "sell").length,
      totalPosts: gamePosts.length
    };
  });
}
```

- [ ] **Step 3: 단위 테스트는 server fetch라 skip. 컴포넌트에서 통합**

- [ ] **Step 4: 커밋**

```bash
git commit -m "feat(market): add listGameBoardStats fetcher for hub page"
```

---

## Task M.2 — `/market` 게임 허브 페이지 + GameHubCard

**Files:**
- Modify: `app/market/page.tsx`
- Create: `components/GameHubCard.tsx`
- Modify: `app/globals.css` (game-hub-grid 스타일)

### Steps

- [ ] **Step 1: GameHubCard 컴포넌트**

```tsx
// components/GameHubCard.tsx
import Link from "next/link";
import { getGameTagClass } from "../lib/market-utils";
import type { GameBoardStat } from "../lib/types";

interface GameHubCardProps {
  stat: GameBoardStat;
}

export function GameHubCard({ stat }: GameHubCardProps) {
  return (
    <Link className={`game-hub-card ${getGameTagClass(stat.game.slug)}`} href={`/market/game/${stat.game.slug}`}>
      <div className="game-hub-card__head">
        <span className="game-tag-large">{stat.game.name}</span>
        <span className="game-hub-card__cta">게시판 열기 →</span>
      </div>
      <div className="game-hub-card__stats">
        <div className="game-hub-card__metric">
          <strong>{stat.totalPosts.toLocaleString("ko-KR")}</strong>
          <span>전체 글</span>
        </div>
        <div className="game-hub-card__metric">
          <strong>{stat.openPosts.toLocaleString("ko-KR")}</strong>
          <span>거래중</span>
        </div>
        <div className="game-hub-card__metric game-hub-card__metric--sell">
          <strong>{stat.sellPosts.toLocaleString("ko-KR")}</strong>
          <span>팝니다</span>
        </div>
        <div className="game-hub-card__metric game-hub-card__metric--buy">
          <strong>{stat.buyPosts.toLocaleString("ko-KR")}</strong>
          <span>삽니다</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: globals.css 스타일 추가**

```css
.game-hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.game-hub-card {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-7);
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);
}

.game-hub-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow), 0 10px 24px rgba(15, 23, 42, 0.12);
}

.game-hub-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.game-tag-large {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  font-size: 1.05rem;
  font-weight: 700;
  white-space: nowrap;
}

/* 게임별 brand color는 .game-tag--{slug} 와 .game-hub-card.game-tag--{slug}로 적용 — 카드 자체에 클래스가 붙으면 .game-tag-large만 별도 색칠 */
.game-hub-card.game-tag--maplestory   .game-tag-large { background: rgba(255, 152, 0, 0.16);  color: var(--game-maple); }
.game-hub-card.game-tag--lineagem     .game-tag-large { background: rgba(91, 33, 182, 0.16);  color: var(--game-lineage); }
.game-hub-card.game-tag--fc-online    .game-tag-large { background: rgba(14, 165, 233, 0.16); color: var(--game-fc); }
.game-hub-card.game-tag--lostark      .game-tag-large { background: rgba(185, 28, 28, 0.16);  color: var(--game-lostark); }
.game-hub-card.game-tag--dnf          .game-tag-large { background: rgba(245, 158, 11, 0.16); color: var(--game-dnf); }
.game-hub-card.game-tag--aion         .game-tag-large { background: rgba(6, 182, 212, 0.16);  color: var(--game-aion); }

.game-hub-card__cta {
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 600;
}

.game-hub-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.game-hub-card__metric {
  display: grid;
  gap: 2px;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-muted);
}

.game-hub-card__metric strong {
  font-size: 1.4rem;
  font-weight: 800;
}

.game-hub-card__metric span {
  font-size: 0.84rem;
  color: var(--muted);
}

.game-hub-card__metric--buy strong { color: var(--trade-buy); }
.game-hub-card__metric--sell strong { color: var(--trade-sell); }
```

- [ ] **Step 3: `/market` 페이지를 hub로 재구성**

```tsx
// app/market/page.tsx
import Link from "next/link";
import { GameHubCard } from "../../components/GameHubCard";
import { listGameBoardStats } from "../../lib/market-server";

export const metadata = {
  title: "거래소 | ITEMMARKET"
};

export default async function MarketPage() {
  const stats = await listGameBoardStats();

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래하고 싶은 게임을 선택해 게시판으로 이동하세요</span>
          <Link href="/sell">팝니다 글 등록</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">MARKET HUB</p>
          <h1>거래소</h1>
          <p>각 게임 게시판으로 이동해 삽니다 / 팝니다 글을 확인하고 댓글로 거래를 이어가세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="game-hub-grid">
            {stats.map((stat) => (
              <GameHubCard key={stat.game.slug} stat={stat} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: 회귀**

`/market` → 게임 6개 카드 그리드. 각 카드에 게임색 + 통계 4개. 클릭 시 `/market/game/[slug]`로.

- [ ] **Step 5: 커밋**

```bash
git commit -m "refactor(market): turn /market into a game hub instead of all-posts feed"
```

---

## Task M.3 — `/market/game/[slug]` sidebar 제거 + GameSubNav 추가

**Files:**
- Modify: `components/MarketBoard.tsx` (board-shell 제거, sub-nav 통합)
- Create: `components/GameSubNav.tsx`
- Modify: `app/market/game/[slug]/page.tsx`
- Modify: `app/globals.css`

### Steps

- [ ] **Step 1: GameSubNav 컴포넌트**

```tsx
// components/GameSubNav.tsx
import Link from "next/link";
import { getGameTagClass } from "../lib/market-utils";
import type { MarketGameOption } from "../lib/types";

interface GameSubNavProps {
  activeSlug?: string;
  games: MarketGameOption[];
}

export function GameSubNav({ activeSlug, games }: GameSubNavProps) {
  return (
    <nav className="game-subnav" aria-label="게임 게시판 이동">
      <Link className={`game-subnav__item${!activeSlug ? " game-subnav__item--active" : ""}`} href="/market">
        <span>전체 허브</span>
      </Link>
      {games.map((game) => (
        <Link
          key={game.slug}
          className={`game-subnav__item ${getGameTagClass(game.slug)}${activeSlug === game.slug ? " game-subnav__item--active" : ""}`}
          href={`/market/game/${game.slug}`}
        >
          <span>{game.name}</span>
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: MarketBoard에서 board-shell 제거 + 사이드바 제거**

`MarketBoard`의 좌측 `board-sidebar` 영역(`game-nav`)을 제거. board-content를 메인 폭에서 사용. 즉 `board-shell` 자체가 grid가 아닌 단일 컬럼.

```tsx
// components/MarketBoard.tsx (간단화)
return (
  <div className="board-content">
    {/* summary-grid */}
    {/* board-list-panel head */}
    {/* filter-panel */}
    {/* game-nav 영역은 더 이상 여기 안 둠 */}
    {/* 게시글 목록 */}
  </div>
);
```

- [ ] **Step 3: `app/market/game/[slug]/page.tsx`에 GameSubNav 추가**

page-hero 아래 sub-nav를 별도 section으로:

```tsx
<section className="section section--compact">
  <div className="container">
    <GameSubNav activeSlug={slug} games={games} />
  </div>
</section>
```

- [ ] **Step 4: globals.css 스타일**

```css
.game-subnav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}

.game-subnav__item {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  white-space: nowrap;
  transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}

.game-subnav__item:hover {
  background: var(--surface-muted);
  color: var(--text);
}

.game-subnav__item--active {
  background: var(--accent);
  color: white;
}

/* 활성 상태에서 게임 brand color 사용 (옵션) */
.game-subnav__item--active.game-tag--maplestory   { background: var(--game-maple); }
.game-subnav__item--active.game-tag--lineagem     { background: var(--game-lineage); }
.game-subnav__item--active.game-tag--fc-online    { background: var(--game-fc); }
.game-subnav__item--active.game-tag--lostark      { background: var(--game-lostark); }
.game-subnav__item--active.game-tag--dnf          { background: var(--game-dnf); }
.game-subnav__item--active.game-tag--aion         { background: var(--game-aion); }

/* board-shell 단순화: 사이드바 없음 */
.board-shell {
  display: block;
}

/* 기존 .board-sidebar / .game-nav 관련 룰은 더 이상 사용 안 됨 — globals에서 제거하거나 미사용 처리 */
```

- [ ] **Step 5: 회귀**

- `/market/game/maplestory` → 상단 sub-nav (전체 허브 / 메이플스토리(active) / 리니지M / FC Online / 로스트아크 / 던전앤파이터 / 아이온) + 메인 폭 100% 게시판
- 다른 게임으로 chip 클릭 시 즉시 이동

- [ ] **Step 6: 커밋**

```bash
git commit -m "refactor(market): replace board sidebar with horizontal game sub-nav, full-width board"
```

---

## Task M.4 — Header 거래소 링크 + 빌드/회귀/push

- [ ] **Step 1: Header 그대로 유지** — `/market`이 hub가 됐으니 Link href="/market" 그대로 OK. 추가 변경 없음.

- [ ] **Step 2: 단위 테스트**

```bash
npm test
```

기대: 55 tests pass (변동 없음 — 본 작업은 page/component 변경, lib helper 추가만).

- [ ] **Step 3: production 빌드**

```bash
npm run build
```

- [ ] **Step 4: production 회귀**

다음 5페이지 스크린샷 + 동작 확인:
- `/market` — 게임 hub 카드 그리드
- `/market/game/maplestory` — sub-nav + 게시판
- `/market/game/aion` — 글 0건 게시판 (빈 상태)
- `/` 홈 — 변경 없음
- `/admin` — 변경 없음

- [ ] **Step 5: push**

---

## 자기 점검

- [x] **Spec coverage:** 사용자 4가지 지적 모두 반영
  - 게임별 카테고리 진입점 분리 → /market을 hub로
  - 전체 게임 전체 게시물 안 보여줌 → /market에 글 목록 없음, 게임 카드만
  - 게시판 페이지에서 좌측 사이드바 제거 → main 폭 100% 활용
  - 좌측 카테고리 허브를 sub-nav로 전환 → GameSubNav (가로 wrap, 게임 N개 늘어도 깨끗)
- [x] **Placeholder 없음:** 모든 step에 코드 블록 명시
- [x] **Type consistency:** `GameBoardStat`이 server fetcher / hub card / sub-nav에서 일관된 shape
