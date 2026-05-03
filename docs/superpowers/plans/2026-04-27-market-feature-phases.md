# Items Market Feature Phases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 거래소 게시판, Supabase 로컬 인증/DB, 거래 CRUD, 마이페이지, 관리자 기능을 순차적으로 구현한다.

**Architecture:** 현재 정적 Next.js 목업을 유지한 채 1단계에서 화면 구조와 목업 데이터를 실제 시나리오에 맞게 재정렬한다. 2단계부터 Supabase local을 추가하고, `auth.users -> profiles -> market_posts -> market_comments` 흐름으로 연결하며, 관리자 기능은 동일 auth 체계에서 `role` 기반으로 분기한다.

**Tech Stack:** Next.js App Router, React, Supabase local, SQL migration, Vitest, Testing Library

---

### Task 1: 거래소 게시판 UI 목업 재구성

**Files:**
- Create: `lib/market-data.js`
- Create: `tests/lib/market-data.test.js`
- Modify: `app/market/page.js`
- Modify: `app/market/[id]/page.js`
- Modify: `app/sell/page.js`
- Modify: `app/buy/page.js`
- Modify: `components/ListingGrid.js`
- Modify: `components/MarketTable.js`
- Modify: `app/globals.css`

- [ ] **Step 1: 게시판 필터/요약 유틸 테스트를 먼저 작성**

```js
import { describe, expect, it } from "vitest";
import { filterMarketPosts, getMarketSummary, getTradeTypeLabel } from "../../lib/market-data";

describe("filterMarketPosts", () => {
  it("filters by trade type, game, and status", () => {
    const result = filterMarketPosts({
      game: "메이플스토리",
      posts: [
        { id: "a", game: "메이플스토리", tradeType: "sell", status: "open" },
        { id: "b", game: "메이플스토리", tradeType: "buy", status: "open" },
        { id: "c", game: "리니지M", tradeType: "sell", status: "closed" }
      ],
      status: "open",
      tradeType: "sell"
    });

    expect(result.map((post) => post.id)).toEqual(["a"]);
  });

  it("builds summary counts for open and closed posts", () => {
    const summary = getMarketSummary([
      { id: "a", tradeType: "sell", status: "open", comments: [{ id: "1" }] },
      { id: "b", tradeType: "buy", status: "closed", comments: [] }
    ]);

    expect(summary).toEqual({
      buyCount: 1,
      commentCount: 1,
      openCount: 1,
      sellCount: 1,
      totalCount: 2
    });
  });

  it("maps trade type codes to Korean labels", () => {
    expect(getTradeTypeLabel("buy")).toBe("삽니다");
    expect(getTradeTypeLabel("sell")).toBe("팝니다");
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npm run test -- tests/lib/market-data.test.js`
Expected: FAIL because `lib/market-data.js` and test runner do not exist yet.

- [ ] **Step 3: 게시판 목업 데이터와 최소 유틸 구현**

```js
export const marketPosts = [
  {
    id: "maple-sell-01",
    category: "게임머니",
    game: "메이플스토리",
    status: "open",
    tradeType: "sell",
    title: "스카니아 메소 120억 분할 판매",
    comments: [{ id: "comment-1" }]
  }
];

export function getTradeTypeLabel(tradeType) {
  return tradeType === "buy" ? "삽니다" : "팝니다";
}

export function filterMarketPosts({ posts, tradeType = "all", game = "all", status = "all" }) {
  return posts.filter((post) => {
    if (tradeType !== "all" && post.tradeType !== tradeType) return false;
    if (game !== "all" && post.game !== game) return false;
    if (status !== "all" && post.status !== status) return false;
    return true;
  });
}

export function getMarketSummary(posts) {
  return posts.reduce(
    (summary, post) => ({
      buyCount: summary.buyCount + (post.tradeType === "buy" ? 1 : 0),
      commentCount: summary.commentCount + post.comments.length,
      openCount: summary.openCount + (post.status === "open" ? 1 : 0),
      sellCount: summary.sellCount + (post.tradeType === "sell" ? 1 : 0),
      totalCount: summary.totalCount + 1
    }),
    { buyCount: 0, commentCount: 0, openCount: 0, sellCount: 0, totalCount: 0 }
  );
}
```

- [ ] **Step 4: 테스트 재실행**

Run: `npm run test -- tests/lib/market-data.test.js`
Expected: PASS

- [ ] **Step 5: 거래소/상세/등록 UI에 새 데이터 구조 반영**

```jsx
<section className="board-shell">
  <aside className="board-sidebar">{/* 게임 목록, 상태 요약 */}</aside>
  <div className="board-content">
    <div className="board-toolbar">{/* 삽니다/팝니다, 게임, 상태 필터 */}</div>
    <ListingGrid items={featuredPosts} />
    <MarketTable items={filteredPosts} />
  </div>
</section>
```

- [ ] **Step 6: 빌드 검증**

Run: `npm run build`
Expected: PASS

### Task 2: Supabase local 인증/스키마 구성

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`
- Create: `supabase/migrations/20260427_init_market.sql`
- Create: `lib/supabase/server.js`
- Create: `lib/supabase/client.js`
- Create: `middleware.js`
- Create: `app/login/page.js`
- Create: `app/signup/page.js`
- Create: `app/admin/login/page.js`

- [ ] **Step 1: profiles/posts/comments/admin 제약을 검증하는 SQL 또는 유틸 테스트 작성**
- [ ] **Step 2: 실패 확인**
Run: `supabase db reset`
Expected: FAIL before migration exists.
- [ ] **Step 3: migration 작성**

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nickname text not null unique,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: auth helper와 로그인/회원가입 페이지 구현**
- [ ] **Step 5: `supabase db reset` 와 `npm run build` 검증**

### Task 3: 게시판 CRUD, 댓글, 거래완료, 마이페이지 연결

**Files:**
- Create: `app/mypage/page.js`
- Create: `app/market/new/page.js`
- Create: `app/market/[id]/edit/page.js`
- Create: `app/actions/market.js`
- Modify: `app/market/page.js`
- Modify: `app/market/[id]/page.js`
- Modify: `app/sell/page.js`
- Modify: `app/buy/page.js`

- [ ] **Step 1: 게시글 생성/수정/삭제/완료 처리 서버 액션 테스트 작성**
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 서버 액션과 폼 연결 구현**
- [ ] **Step 4: 내 글 목록, 거래상태 필터, 댓글 등록 구현**
- [ ] **Step 5: 시나리오 검증**
Run: `npm run build`
Expected: PASS

### Task 4: 관리자 UI, 회원 관리, 월별 조회, export 구현

**Files:**
- Create: `app/admin/page.js`
- Create: `app/admin/posts/page.js`
- Create: `app/admin/members/page.js`
- Create: `app/admin/members/[id]/page.js`
- Create: `lib/export/member-posts-export.js`
- Modify: `app/admin/login/page.js`

- [ ] **Step 1: 관리자 접근 제한 테스트 작성**
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 관리자 게시물/회원 목록 UI 구현**
- [ ] **Step 4: 월단위 필터, 회원별 게시글 조회, CSV/Excel export 구현**
- [ ] **Step 5: 캡처 export가 필요하면 HTML 렌더 기반 이미지 export 추가**
- [ ] **Step 6: 최종 빌드 및 관리자 시나리오 검증**

### Spec Coverage Check

- 거래소 게시판 UI: Task 1
- Supabase local auth/DB: Task 2
- 거래 CRUD/댓글/거래완료/마이페이지: Task 3
- 관리자 로그인/게시물 관리/회원 관리/export: Task 4

### Current Execution Choice

사용자 요청이 순차 구현이므로 이 세션에서는 별도 선택 대기 없이 **Inline Execution**으로 Task 1부터 진행한다.
