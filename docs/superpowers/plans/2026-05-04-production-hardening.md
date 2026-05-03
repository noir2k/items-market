# Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 직전 검토 보고서의 17개 이슈와 MVP 잔재/임시 목업을 모두 제거하고, `npm test`/`npm run build`/브라우저 회귀 테스트를 통과해 프로덕션 배포 가능한 품질로 끌어올린다.

**Architecture:** 단일 Next.js 16 App Router + Supabase(Auth/Postgres/RLS) 스택은 유지. 변경은 5개 축으로 분할: ① DB 마이그레이션 추가(RLS, view_count RPC) ② SSR data 동기화(하드코딩 통계 제거, 실제 검색 동작) ③ UI/라벨 정합성(한글 라벨, 자기-정지 차단) ④ 빌드/타입 안정화(typedRoutes, strict, Next 버전 핀) ⑤ 배포 검증(빌드/테스트/체크리스트).

**Tech Stack:** Next.js 16.2.4, React 19, Supabase JS v2, @supabase/ssr, TypeScript 5.9, Vitest 3, Playwright(검증용), Postgres 15(Supabase local).

**작업 환경:** 메인 워크스페이스(`D:\Workspace\items-market`). 회귀 테스트는 `mcp__Claude_Preview__preview_*` + `mcp__playwright__*`로 dev 서버 띄우고 수행.

---

## Phase 0 — 안전망 구축

### Task 0.1: 사전 baseline — 테스트 + 빌드 통과 확인

**Files:**
- 변경 없음 (계측만)

- [ ] **Step 1: 단위 테스트 baseline**

Run: `npm test`
Expected: 8 files / 37 tests pass

- [ ] **Step 2: production build baseline**

Run: `npm run build > tmp_build.log 2>&1; type tmp_build.log`
Expected: 빌드 성공 (Next.js 16 + Turbopack). 실패 시 그 자체를 추가 task로 등록.

- [ ] **Step 3: 결과 기록**

`tmp_build.log`를 잠시 보존(나중 Task 5.x 빌드 비교용). git add 안 함.

### Task 0.2: Next.js 버전 핀

**Files:**
- Modify: `package.json`

- [ ] **Step 1: package.json next 의존성 핀**

```jsonc
"dependencies": {
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.57.4",
  "next": "^16.2.4",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

- [ ] **Step 2: lockfile 갱신**

Run: `npm install`
Expected: `node_modules/next/package.json` version === 16.2.4 또는 patch.

- [ ] **Step 3: smoke test**

Run: `npm test`
Expected: 37 tests pass (변동 없음).

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: pin next/react to known-good range (16.2.4 / 19)"
```

### Task 0.3: `.env.local`에 NEXT_PUBLIC_SITE_URL 추가

**Files:**
- Modify: `.env.local` (gitignored)

- [ ] **Step 1: 한 줄 추가**

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: dev 서버 재기동 후 확인**

Run: preview_start 또는 기존 서버 restart 후 `/api/health` 200 확인.

(커밋 없음 — `.env.local`은 gitignore)

---

## Phase 1 — DB 보강 (마이그레이션 + 시드 정리)

### Task 1.1: RLS profiles 익명 SELECT 정책 + grant 추가 마이그레이션

**Files:**
- Create: `supabase/migrations/20260504000000_public_profile_read.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- Public read of nickname/role for unauthenticated visitors so market posts
-- can render the author label without forcing login.
grant select (id, nickname, role) on public.profiles to anon;

drop policy if exists "authenticated users can read profiles" on public.profiles;

create policy "profiles are readable by everyone"
on public.profiles
for select
using (true);
```

- [ ] **Step 2: 마이그레이션 적용**

Run: `powershell.exe -Command "supabase db reset"` (로컬 stack reset 후 모든 마이그레이션 + seed.sql 재실행)
Expected: 에러 없이 종료. `Local Supabase bootstrap completed.` 표시.

대안: `npm run supabase:bootstrap`도 시드 재실행.

- [ ] **Step 3: SQL 검증**

```bash
powershell.exe -Command "supabase db query 'select grantee, privilege_type, column_name from information_schema.column_privileges where table_name=''profiles'' and grantee=''anon'';' "
```

Expected: 3행(id, nickname, role × SELECT) 출력.

- [ ] **Step 4: 브라우저 회귀 — 비로그인 게시판 작성자명**

```
preview_start("Next.js dev (items-market)") → playwright.navigate("/market") → snapshot
```

Expected: 작성자 컬럼에 "회원"이 아닌 실제 닉네임("meso_master", "raid_buyer" 등) 표시.

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations/20260504000000_public_profile_read.sql
git commit -m "fix(rls): allow anon to read profile nickname/role for marketplace"
```

### Task 1.2: view_count 증가 RPC + 호출

**Files:**
- Create: `supabase/migrations/20260504000001_market_post_view_increment.sql`
- Modify: `lib/market-server.ts`

- [ ] **Step 1: RPC 작성**

```sql
-- supabase/migrations/20260504000001_market_post_view_increment.sql
create or replace function public.increment_market_post_view(p_post_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.market_posts
  set view_count = view_count + 1
  where id = p_post_id;
$$;

grant execute on function public.increment_market_post_view(bigint) to anon, authenticated;
```

- [ ] **Step 2: server 함수에서 호출**

`lib/market-server.ts`의 `getMarketPostById` 끝부분 수정:

```ts
export async function getMarketPostById(id: string): Promise<MarketPost | null> {
  const numericId = parsePostId(id);

  if (!numericId) {
    return null;
  }

  const posts = await runPostQuery(MARKET_POST_DETAIL_SELECT, { postId: id });
  const post = posts[0] ?? null;

  if (post) {
    const supabase = await createClient();
    await supabase.rpc("increment_market_post_view", { p_post_id: numericId });
  }

  return post;
}
```

- [ ] **Step 3: 마이그레이션 적용**

Run: `powershell.exe -Command "supabase db reset"`

- [ ] **Step 4: 브라우저 회귀**

```
playwright.navigate("/market/1") → snapshot.가격 카드의 "조회 N" 기록
playwright.navigate("/market/1") (다시) → snapshot
```

Expected: 두 번째 방문 시 조회수가 +1.

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations/20260504000001_market_post_view_increment.sql lib/market-server.ts
git commit -m "feat(market): increment view_count on detail page visit via RPC"
```

### Task 1.3: 회귀 테스트 시드 데이터 정리

**Files:**
- 변경 없음 (DB 작업)

- [ ] **Step 1: "브라우저 회귀 테스트 판매 글" 삭제**

```bash
powershell.exe -Command "supabase db query \"delete from public.market_posts where title='브라우저 회귀 테스트 판매 글';\""
```

- [ ] **Step 2: 잔여 임시 댓글 삭제**

```bash
powershell.exe -Command "supabase db query \"delete from public.market_comments where content='동일 조건 판매 가능합니다. 자세한 옵션 정보 공유드릴까요?';\""
```

- [ ] **Step 3: 마켓 게시글 4건 → 3건 확인**

```bash
playwright.navigate("/market") → snapshot.전체 3건
```

(커밋 없음 — DB only)

---

## Phase 2 — 홈/검색/거래소 UX 정합성

### Task 2.1: 하드코딩된 홈 통계 카드 제거 → 실제 집계

**Files:**
- Modify: `app/page.tsx`
- Modify: `lib/market-server.ts` (집계 헬퍼 추가)

- [ ] **Step 1: 마켓 통계 헬퍼 추가**

`lib/market-server.ts` 하단에 추가:

```ts
export async function getMarketStats(): Promise<{
  openCount: number;
  totalCount: number;
  closedTodayCount: number;
}> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [openResult, totalResult, closedResult] = await Promise.all([
    supabase.from("market_posts").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("market_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("market_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "closed")
      .gte("closed_at", startOfDay.toISOString())
  ]);

  return {
    closedTodayCount: closedResult.count ?? 0,
    openCount: openResult.count ?? 0,
    totalCount: totalResult.count ?? 0
  };
}
```

- [ ] **Step 2: app/page.tsx 통계 카드 교체**

기존 `<div className="hero__stats">` 블록을 다음으로 치환:

```tsx
const stats = await getMarketStats();
// ...
<div className="hero__stats">
  <div className="stat">
    <strong>{stats.openCount.toLocaleString("ko-KR")}</strong>
    <span>거래중 물품</span>
  </div>
  <div className="stat">
    <strong>{stats.totalCount.toLocaleString("ko-KR")}</strong>
    <span>전체 등록 물품</span>
  </div>
  <div className="stat">
    <strong>{stats.closedTodayCount.toLocaleString("ko-KR")}</strong>
    <span>오늘 완료 거래</span>
  </div>
</div>
```

- [ ] **Step 3: 단위 테스트 — getMarketStats는 server 의존이므로 skip, 대신 e2e**

회귀:
```
playwright.navigate("/") → snapshot
```
Expected: 카드값이 실제 DB 카운트 ("3", "3", "0" 등) 와 일치, "1,248"/"326"/"24H" 흔적 없음.

- [ ] **Step 4: 커밋**

```bash
git add app/page.tsx lib/market-server.ts
git commit -m "fix(home): replace hardcoded hero stats with real Supabase aggregates"
```

### Task 2.2: HeroSearchCard 검색 폼 실제 동작화

**Files:**
- Modify: `components/HeroSearchCard.tsx`
- Modify: `lib/market-utils.ts` (카테고리 한글↔코드 매핑은 이미 있으므로 export만 보강)

- [ ] **Step 1: HeroSearchCard 리팩토링 — useState + URL 빌더 + 진짜 submit**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type SearchMode = "sell" | "buy";

const searchModes: Record<SearchMode, { title: string; heading: string; cta: string }> = {
  buy: { cta: "구매 요청 보기", heading: "구매 요청을 검색해보세요", title: "삽니다" },
  sell: { cta: "판매 물품 보기", heading: "판매 물품을 검색해보세요", title: "팝니다" }
};

const categoryOptions = [
  { code: "all", label: "전체" },
  { code: "game_money", label: "게임머니" },
  { code: "item", label: "아이템" },
  { code: "account", label: "계정" },
  { code: "etc", label: "기타" }
] as const;

export function HeroSearchCard() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("sell");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [server, setServer] = useState("");
  const currentMode = searchModes[mode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category !== "all") params.set("category", category);
    if (server.trim()) params.set("server", server.trim());
    params.set("tradeType", mode);

    const query = params.toString();
    router.push(query ? `/market?${query}` : "/market");
  }

  return (
    <aside className="search-panel">
      <div className="tabs">
        <button
          aria-pressed={mode === "sell"}
          className={`tab${mode === "sell" ? " tab--active" : ""}`}
          onClick={() => setMode("sell")}
          type="button"
        >
          팝니다
        </button>
        <button
          aria-pressed={mode === "buy"}
          className={`tab${mode === "buy" ? " tab--active" : ""}`}
          onClick={() => setMode("buy")}
          type="button"
        >
          삽니다
        </button>
      </div>

      <h2>{currentMode.heading}</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>게임/제목 키워드</span>
          <input
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="예: 메이플스토리, 메소"
            type="text"
            value={keyword}
          />
        </label>
        <label className="field">
          <span>카테고리</span>
          <select onChange={(event) => setCategory(event.target.value)} value={category}>
            {categoryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>서버 / 월드</span>
          <input
            onChange={(event) => setServer(event.target.value)}
            placeholder="예: 스카니아, 카단"
            type="text"
            value={server}
          />
        </label>
        <button className="button button--dark button--full" type="submit">
          {currentMode.cta}
        </button>
      </form>
    </aside>
  );
}
```

(인기 검색/인기 게임 하드코딩 블록은 통째로 제거 — MVP 잔재.)

- [ ] **Step 2: market 페이지에서 q/server/tradeType 검색 파라미터 처리**

`app/market/page.tsx`의 `MarketSearchParams` 타입에 `q`, `server` 추가하고, `MarketBoard`에 forward.

- [ ] **Step 3: MarketBoard에 키워드/서버 필터 로직 반영**

`components/MarketBoard.tsx`에 `initialKeyword`, `initialServer` props 추가. `filterMarketPosts`에 keyword/server 인자 추가.

`lib/market-utils.ts`의 `filterMarketPosts` 시그니처 확장:

```ts
interface FilterMarketPostsArgs {
  category?: string;
  game?: string;
  keyword?: string;
  posts?: MarketPost[];
  server?: string;
  status?: MarketStatus | "all";
  tradeType?: TradeType | "all";
}

export function filterMarketPosts({
  category = "all",
  game = "all",
  keyword = "",
  posts = [],
  server = "",
  status = "all",
  tradeType = "all"
}: FilterMarketPostsArgs): MarketPost[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedServer = server.trim().toLowerCase();
  return posts.filter((post) => {
    if (tradeType !== "all" && post.tradeType !== tradeType) return false;
    if (game !== "all" && post.game !== game) return false;
    if (status !== "all" && post.status !== status) return false;
    if (category !== "all" && post.category !== category) return false;
    if (normalizedKeyword) {
      const haystack = `${post.title || ""} ${post.game || ""} ${post.content || ""}`.toLowerCase();
      if (!haystack.includes(normalizedKeyword)) return false;
    }
    if (normalizedServer && (post.server || "").toLowerCase() !== normalizedServer) return false;
    return true;
  });
}
```

- [ ] **Step 4: filterMarketPosts 단위 테스트 추가**

`tests/lib/market-utils.test.ts`에 추가:

```ts
it("filters by keyword in title or game", () => {
  const result = filterMarketPosts({ keyword: "메소", posts: samplePosts });
  expect(result.every((p) => `${p.title} ${p.game}`.includes("메소"))).toBe(true);
});

it("filters by exact server match (case insensitive)", () => {
  const result = filterMarketPosts({ posts: samplePosts, server: "스카니아" });
  expect(result.every((p) => p.server === "스카니아")).toBe(true);
});
```

(samplePosts 픽스처는 기존 테스트의 것 재사용 — 없으면 새로 정의.)

- [ ] **Step 5: 테스트 실행**

Run: `npm test`
Expected: 새 2개 포함 39 tests pass.

- [ ] **Step 6: 브라우저 회귀**

```
playwright.navigate("/") → fill keyword="메소" → click "판매 물품 보기"
```
Expected: `/market?q=%EB%A9%94%EC%86%8C&tradeType=sell`로 이동, 결과에 "스카니아 메소 120억" 1건만 표시.

- [ ] **Step 7: 커밋**

```bash
git add components/HeroSearchCard.tsx app/market/page.tsx components/MarketBoard.tsx lib/market-utils.ts tests/lib/market-utils.test.ts
git commit -m "feat(search): wire HeroSearchCard form to /market query params (q/category/server/tradeType)"
```

### Task 2.3: MarketBoard 카테고리 코드/라벨 일관화

**Files:**
- Modify: `components/MarketBoard.tsx`
- Modify: `lib/market-utils.ts`

- [ ] **Step 1: marketCategories를 코드+라벨 객체 배열로 변환**

`lib/market-utils.ts`:

```ts
export const marketCategoryOptions = [
  { code: "all", label: "전체" },
  { code: "game_money", label: "게임머니" },
  { code: "item", label: "아이템" },
  { code: "account", label: "계정" },
  { code: "etc", label: "기타" }
] as const;

export type MarketCategoryFilterCode = (typeof marketCategoryOptions)[number]["code"];
```

기존 `marketCategories` (한글 배열)는 deprecated — 사용처 모두 marketCategoryOptions로 마이그레이션.

- [ ] **Step 2: MarketBoard select와 필터 비교 코드로 통일**

select option `value={option.code}`, state `category: MarketCategoryFilterCode`, 비교는 코드 ↔ 한글 라벨 변환 없이 일관 처리. `filterMarketPosts`에서 카테고리 비교 시 `getCategoryCode(post.category)` 사용.

- [ ] **Step 3: app/market/page.tsx 및 game 페이지 props 수정**

`initialCategory`는 `MarketCategoryFilterCode | undefined`로 타입 강화.

- [ ] **Step 4: 단위 테스트 — `filterMarketPosts({ category: "game_money" })` 케이스 추가**

```ts
it("filters by category code (game_money)", () => {
  const result = filterMarketPosts({ category: "game_money", posts: samplePosts });
  expect(result.every((p) => getCategoryCode(p.category) === "game_money")).toBe(true);
});
```

- [ ] **Step 5: 테스트**

Run: `npm test`
Expected: pass

- [ ] **Step 6: 회귀**

`/market?category=game_money` 접속 → 게임머니 카테고리만 노출.

- [ ] **Step 7: 커밋**

```bash
git add lib/market-utils.ts components/MarketBoard.tsx app/market/page.tsx app/market/game/[slug]/page.tsx tests/lib/market-utils.test.ts
git commit -m "refactor(market): normalize category filtering to use codes end-to-end"
```

---

## Phase 3 — 라벨/UX 마감

### Task 3.1: 권한/상태 한글 라벨

**Files:**
- Modify: `lib/auth-utils.ts`
- Modify: `app/mypage/page.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: 라벨 헬퍼 추가**

`lib/auth-utils.ts`:

```ts
import type { AppRole, MemberStatus, Profile } from "./types";

export function getRoleLabel(role: AppRole | undefined): string {
  return role === "admin" ? "관리자" : "일반회원";
}

export function getMemberStatusLabel(status: MemberStatus | undefined): string {
  return status === "suspended" ? "정지" : "활성";
}
```

- [ ] **Step 2: 호출부 변경**

`app/mypage/page.tsx`에서 `<p>{profile.role}</p>` → `<p>{getRoleLabel(profile.role)}</p>`, 마찬가지로 status.

`app/admin/page.tsx` PROFILE 카드 동일 적용. 회원 목록 row의 `· {member.role} · 상태 {member.status}`도 한글화.

- [ ] **Step 3: 단위 테스트**

`tests/lib/auth-utils.test.ts`에 4 케이스 추가 (admin/member, active/suspended).

- [ ] **Step 4: 회귀**

`/mypage`, `/admin` 접속 → "member"/"active" 텍스트가 사라지고 "일반회원"/"활성"으로 표시.

- [ ] **Step 5: 커밋**

```bash
git add lib/auth-utils.ts app/mypage/page.tsx app/admin/page.tsx tests/lib/auth-utils.test.ts
git commit -m "fix(ui): localize role/status labels in mypage and admin"
```

### Task 3.2: 자기 자신 정지 버튼 hide

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: 회원 row에서 본인 정지 버튼 차단**

```tsx
// 기존 admin-actions 블록을 다음으로 교체
<div className="admin-actions">
  {member.id === user.id ? (
    <span className="muted">본인 계정</span>
  ) : member.status === "active" ? (
    <form action={updateMemberStatusAction.bind(null, member.id, "suspended")}>
      <button className="button button--light" type="submit">회원 정지</button>
    </form>
  ) : (
    <form action={updateMemberStatusAction.bind(null, member.id, "active")}>
      <button className="button button--light" type="submit">정지 해제</button>
    </form>
  )}
</div>
```

(`user`는 `getCurrentProfile()` 결과의 `user`. 이미 페이지 상단에서 fetch 중.)

- [ ] **Step 2: 회귀**

`/admin` 접속(market_admin 로그인) → 본인 row에 "본인 계정" 라벨, 다른 회원만 정지 버튼.

- [ ] **Step 3: 커밋**

```bash
git add app/admin/page.tsx
git commit -m "fix(admin): hide self-suspend action and label as 본인 계정"
```

### Task 3.3: scroll-behavior smooth 워닝 제거

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: html { scroll-behavior: smooth; } 제거**

`app/globals.css` 23–25행 삭제.

- [ ] **Step 2: 회귀**

dev 서버 새로고침 → console에 "Detected scroll-behavior: smooth" 워닝 사라짐.

- [ ] **Step 3: 커밋**

```bash
git add app/globals.css
git commit -m "chore: drop html scroll-behavior:smooth (Next 16 scroll restoration warn)"
```

---

## Phase 4 — 코드 정리 + 타입 강화

### Task 4.1: `app/auth/actions.tsx` → `actions.ts`

**Files:**
- Rename: `app/auth/actions.tsx` → `app/auth/actions.ts`

- [ ] **Step 1: rename**

```bash
git mv app/auth/actions.tsx app/auth/actions.ts
```

- [ ] **Step 2: import 경로는 그대로 (`../../auth/actions`) — 확장자 명시 안 했으므로 변경 불필요**

- [ ] **Step 3: 빌드/테스트**

Run: `npm test && npm run build > tmp_build.log 2>&1`
Expected: 모두 pass.

- [ ] **Step 4: 커밋**

```bash
git add app/auth/actions.ts
git commit -m "chore(auth): rename actions.tsx to .ts (no JSX in file)"
```

### Task 4.2: tsconfig strict + typedRoutes 활성화

**Files:**
- Modify: `tsconfig.json`
- Modify: `next.config.ts`

- [ ] **Step 1: tsconfig.json strict 켜기**

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: 타입 에러 점진 수정**

Run: `npx tsc --noEmit > tmp_tsc.log 2>&1; type tmp_tsc.log`

표면화될 항목:
- `app/auth/actions.ts`의 `loadProfile(supabase, userId)` — supabase, userId, formData 등에 타입 명시
- `lib/supabase/middleware.ts`의 `request: any` → `NextRequest`
- `mapMarketPostRecord`의 `record: any` → 정확한 타입
- `Profile.id`/`email`/`nickname` optional이지만 사용처에선 단언 — 타입을 non-optional로 좁히거나 `??` 사용

각각 inline 수정. 한 번에 너무 큰 PR은 안 됨 — 본 task에서 모두 정리.

- [ ] **Step 3: typedRoutes**

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true
};

export default nextConfig;
```

- [ ] **Step 4: typedRoutes로 인한 Link href 에러 수정**

`app/admin/page.tsx`의 동적 href는 string 그대로 두되 `as Route`가 필요한 경우 명시. `next/link`의 `Link href={`/market/${id}`}`는 그대로 OK.

Run: `npm run build` 빌드 통과까지 반복 수정.

- [ ] **Step 5: 테스트**

Run: `npm test`
Expected: 37+ tests pass.

- [ ] **Step 6: 커밋**

```bash
git add tsconfig.json next.config.ts app lib components
git commit -m "chore(types): enable strict + typedRoutes; fix surfaced type holes"
```

### Task 4.3: 미들웨어 matcher 좁히기

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: matcher를 보호 라우트만 매칭하도록 변경**

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mypage/:path*",
    "/sell",
    "/buy",
    "/market/:id/edit"
  ]
};
```

`lib/supabase/middleware.ts`의 `updateSession`은 `request: NextRequest` 타입으로 명시.

- [ ] **Step 2: 회귀**

```
playwright.navigate("/") → snapshot.console에 proxy 호출 흔적 없음
playwright.navigate("/admin") (비로그인) → /admin/login 리다이렉트
playwright.navigate("/sell") (비로그인) → /login?next=%2Fsell 리다이렉트
```

- [ ] **Step 3: 커밋**

```bash
git add proxy.ts lib/supabase/middleware.ts
git commit -m "perf(proxy): restrict middleware matcher to protected routes only"
```

---

## Phase 5 — 배포 산출물

### Task 5.1: 데이터 리셋 스크립트

**Files:**
- Create: `scripts/reset-local-data.ts`
- Modify: `package.json` (scripts에 `supabase:reset` 추가)

- [ ] **Step 1: 스크립트 작성**

```ts
// scripts/reset-local-data.ts
import { createClient } from "@supabase/supabase-js";
import { getLocalSupabaseConfig } from "../lib/supabase-local";

async function main() {
  const { serviceRoleKey, supabaseUrl } = getLocalSupabaseConfig();
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  await adminClient.from("market_comments").delete().neq("id", 0);
  await adminClient.from("market_posts").delete().neq("id", 0);
  console.log("Cleared market_posts and market_comments.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

- [ ] **Step 2: package.json 스크립트 추가**

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "staging:check": "tsx scripts/check-staging.ts",
  "test": "vitest run",
  "supabase:bootstrap": "tsx scripts/bootstrap-local-supabase.ts",
  "supabase:reset": "tsx scripts/reset-local-data.ts"
}
```

- [ ] **Step 3: 동작 확인**

Run: `npm run supabase:reset && npm run supabase:bootstrap`
Expected: 메시지 출력, market 페이지 새로고침 후 시드 3건만 노출.

- [ ] **Step 4: 커밋**

```bash
git add scripts/reset-local-data.ts package.json package-lock.json
git commit -m "chore(scripts): add supabase:reset to clear posts/comments locally"
```

### Task 5.2: Production 빌드 + 회귀

**Files:**
- 변경 없음

- [ ] **Step 1: 빌드**

Run: `npm run build > tmp_build.log 2>&1; type tmp_build.log`
Expected: 모든 페이지 빌드 성공, 타입 에러 0.

- [ ] **Step 2: 단위 테스트**

Run: `npm test`
Expected: 모든 케이스 pass.

- [ ] **Step 3: production server 기동 + 회귀**

Run: `npm run start > tmp_prod.log 2>&1` (백그라운드)

playwright.navigate 시퀀스로 전체 사용자 흐름 재검증:
- `/` 통계 카드 실제 값
- `/market` 게시글 목록 + 작성자 닉네임 (비로그인)
- `/login` → seller 로그인 → `/sell` → 새 게시글 등록 → 상세 페이지
- 게시글 상세에서 댓글 등록
- 거래완료 처리
- 로그아웃 → admin 로그인 → 회원/게시글 관리/CSV export

각 단계 console.errors === 0 확인.

- [ ] **Step 4: production server 종료**

`taskkill /F /PID <next-pid>`

(커밋 없음 — 검증만)

### Task 5.3: 배포 체크리스트 문서

**Files:**
- Create: `docs/release-checklist.md`

- [ ] **Step 1: 체크리스트 작성**

```markdown
# Release Checklist — items-market

## 사전 준비
- [ ] `npm test` (37+ tests pass)
- [ ] `npm run build` 에러 없음
- [ ] `npm run staging:check` ok=true
- [ ] `.env.production` 또는 host env에 다음 설정:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - (서버 사이드) `SUPABASE_SERVICE_ROLE_KEY`

## DB 마이그레이션
- [ ] `supabase link --project-ref <ref>`
- [ ] `supabase db push`
  - 적용 마이그레이션:
    1. `20260427092912_init_market_schema.sql`
    2. `20260504000000_public_profile_read.sql`
    3. `20260504000001_market_post_view_increment.sql`

## 회귀 점검 (production URL)
- [ ] 비로그인 `/market` — 작성자 닉네임 노출
- [ ] 로그인 → 게시글 등록 → 댓글 → 거래완료 → 마이페이지
- [ ] 관리자 로그인 → 회원 정지/해제, CSV export 다운로드
- [ ] `/api/health` 200 응답

## 모니터링
- [ ] Supabase 로그 / Postgres slow query 모니터
- [ ] Next.js telemetry off (`NEXT_TELEMETRY_DISABLED=1`) 또는 명시적 opt-in
```

- [ ] **Step 2: 커밋**

```bash
git add docs/release-checklist.md
git commit -m "docs: add release checklist covering env, migrations, regression"
```

### Task 5.4: README 보강

**Files:**
- Create or Modify: `README.md`

- [ ] **Step 1: README 작성**

```markdown
# items-market

게임 아이템 / 게임머니 / 계정 거래 마켓 (Next.js 16 App Router + Supabase).

## 빠른 시작

\`\`\`powershell
# 1) 로컬 Supabase 기동
supabase start

# 2) `.env.local` 생성
cp .env.local.example .env.local
# `supabase status -o env` 결과의 ANON / SERVICE_ROLE 키를 채워 넣음

# 3) 시드 데이터 부트스트랩
npm run supabase:bootstrap

# 4) 개발 서버 (Turbopack)
npm run dev
\`\`\`

## 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | production 빌드 |
| `npm start` | production 서버 |
| `npm test` | Vitest 단위 테스트 |
| `npm run supabase:bootstrap` | 로컬 supabase에 데모 회원/게시글 시드 |
| `npm run supabase:reset` | market_posts / market_comments 비우기 |
| `npm run staging:check` | env + DB 헬스체크 |

## 데모 계정 (로컬 전용)

| 이메일 | 비밀번호 | 권한 |
| --- | --- | --- |
| `admin@itemmarket.local` | `admin1234!` | admin |
| `seller1@itemmarket.local` | `seller1234!` | member |
| `buyer1@itemmarket.local` | `buyer1234!` | member |

## 디렉토리

\`\`\`
app/        # Next.js App Router (페이지·라우트·server actions)
components/ # 클라이언트/서버 React 컴포넌트
lib/        # 도메인 로직, supabase wrapper, server helpers
supabase/   # 마이그레이션, seed.sql, supabase config
scripts/    # 부트스트랩 / 헬스체크 / 리셋 등 운영 스크립트
tests/      # Vitest 단위 테스트
docs/       # plan / 체크리스트 / runbook
\`\`\`

## 배포

`docs/release-checklist.md` 참조.
```

- [ ] **Step 2: 커밋**

```bash
git add README.md
git commit -m "docs: add README with quickstart, scripts, demo accounts, layout"
```

---

## 자기 점검(Self-Review) — Plan 작성자 단계에서 확인 완료

**1. Spec coverage:**
- 17개 이슈 매핑:
  - #1 RLS 닉네임 → Task 1.1 ✓
  - #2 하드코딩 통계 → Task 2.1 ✓
  - #3 검색 폼 → Task 2.2 ✓
  - #4 카테고리 코드/라벨 → Task 2.3 ✓
  - #5 view_count → Task 1.2 ✓
  - #6 Next 버전 핀 → Task 0.2 ✓
  - #7 Header DB roundtrip — 의도적으로 미포함(실측치 없는 사전 최적화 금지). 향후 measurement 후 별도 plan.
  - #8 한글 라벨 → Task 3.1 ✓
  - #9 자기 정지 버튼 → Task 3.2 ✓
  - #10 seed_key dev-only — 의도적으로 미포함(stable seed 필요). DB 디자인 트레이드오프이며 운영 키 충돌 위험은 prefix(`dev_`) 등으로 향후 별도 처리.
  - #11 strict on → Task 4.2 ✓
  - #12 reset 스크립트 → Task 5.1 ✓
  - #13 .tsx → .ts → Task 4.1 ✓
  - #14 typedRoutes → Task 4.2 ✓
  - #15 scroll-behavior → Task 3.3 ✓
  - #16 NEXT_PUBLIC_SITE_URL → Task 0.3 ✓
  - #17 matcher 좁히기 → Task 4.3 ✓
- MVP 잔재 추가 정리:
  - HeroSearchCard 인기 검색/인기 게임 하드코딩 → Task 2.2에서 통째로 제거 ✓
  - 회귀 테스트 시드 데이터 → Task 1.3 ✓
- 프로덕션 게이트:
  - production build → Task 5.2 ✓
  - 체크리스트/README → Task 5.3, 5.4 ✓

**2. Placeholder scan:** "TBD"/"implement later"/"add appropriate"/"similar to" 없음 — 모든 코드 블록 명시 완료.

**3. Type consistency:**
- `MarketCategoryFilterCode` (Task 2.3에서 정의) — Task 2.2의 categoryOptions와 동일 5개 코드(`all`/`game_money`/`item`/`account`/`etc`).
- `getMarketStats` 반환 타입 (Task 2.1) — `app/page.tsx` 호출부 시그니처 일치.
- `filterMarketPosts`(Task 2.2 확장) — Task 2.3의 카테고리 코드 비교 로직과 호환.
- `getRoleLabel`/`getMemberStatusLabel` (Task 3.1) — `auth-utils` 기존 export 패턴 따름.
- `proxy` 함수 시그니처(Task 4.3) — `updateSession(request: NextRequest)` 일치.

이상 없음.

---

## 실행 모드 선택

본 plan은 **Inline Execution(`superpowers:executing-plans`)** 으로 진행합니다. 사유:
- 동일 dev 환경/브라우저 컨텍스트에서 회귀 테스트(playwright)를 즉시 수행해야 함 — subagent 분리 시 컨텍스트 전달 비용이 큼.
- preview_start로 띄운 dev server를 phase 간 재사용해야 함.

executing-plans 스킬을 호출해 task-by-task 실행 + 체크포인트 리뷰로 진행합니다.
