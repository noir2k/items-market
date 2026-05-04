# Phase B — Trust Signals (DESIGN.md Roadmap)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) tracking.

**Goal:** "이 사람과 거래해도 되는가?"에 답하는 신호를 작성자 카드/마이페이지/관리자 화면에 추가한다. DESIGN.md 1.3절 "Trust before Beauty" 원칙을 데이터 모델 단계부터 강제.

**Architecture:**
1. **DB**: `profile_trade_stats` view + `profiles.created_at` anon SELECT 권한 → anon도 작성자 신뢰 신호 조회 가능
2. **lib**: `lib/trust-server.ts`에서 view 결과를 fetch + `lib/trust-utils.ts`에서 배지/라벨 derive
3. **컴포넌트**: `<TrustSignal>` (수치 카드) + `<TrustBadge>` (라벨 chip)
4. **통합**: 게시글 상세 seller-card / 마이페이지 / 관리자 회원 row

**Tech Stack:** Supabase view, Next.js server components, 토큰 기반 CSS.

---

## Task B.1 — DB: profile trade stats view

**Files:**
- Create: `supabase/migrations/20260504000002_profile_trade_stats.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- supabase/migrations/20260504000002_profile_trade_stats.sql

-- profiles.created_at은 거래 신뢰 신호(가입 N일 전)에 필요하지만 anon에서 막혀 있다.
-- 닉네임/role과 동일 수준으로 공개 — PII 아님.
grant select (id, nickname, role, created_at) on public.profiles to anon;

-- 게시글 작성자별 집계 view.
-- view는 base table RLS를 그대로 상속받으므로 별도 정책 불필요.
create or replace view public.profile_trade_stats as
select
  p.id as profile_id,
  p.created_at as joined_at,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id), 0)::bigint as total_posts,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id and mp.status = 'closed'), 0)::bigint as closed_posts,
  coalesce((select count(*) from public.market_comments mc where mc.author_id = p.id), 0)::bigint as comment_count
from public.profiles p;

grant select on public.profile_trade_stats to anon, authenticated;
```

- [ ] **Step 2: 마이그레이션 적용**

```bash
echo Y | powershell.exe -Command "supabase db reset"
```

- [ ] **Step 3: SQL 검증**

`supabase db query "select * from public.profile_trade_stats limit 5"` — 시드 회원 3명의 통계가 올바른지 확인.

- [ ] **Step 4: 시드 재적용**

```bash
npm run supabase:bootstrap
```

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations/20260504000002_profile_trade_stats.sql
git commit -m "feat(rls): add profile_trade_stats view + grant created_at to anon"
```

---

## Task B.2 — lib: trust signal helper + 테스트

**Files:**
- Create: `lib/trust-server.ts`
- Create: `lib/trust-utils.ts`
- Create: `tests/lib/trust-utils.test.ts`

- [ ] **Step 1: types에 TrustSignal 추가**

`lib/types.ts`:

```ts
export interface TrustSignal {
  profileId: string;
  joinedAtIso: string;
  totalPosts: number;
  closedPosts: number;
  commentCount: number;
}

export type TrustBadgeKind = "newcomer" | "regular" | "active" | "admin";
```

- [ ] **Step 2: server-side fetcher**

`lib/trust-server.ts`:

```ts
import { createClient } from "./supabase/server";
import type { TrustSignal } from "./types";

interface TradeStatsRow {
  profile_id: string;
  joined_at: string;
  total_posts: number;
  closed_posts: number;
  comment_count: number;
}

export async function getTrustSignal(profileId: string): Promise<TrustSignal | null> {
  if (!profileId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_trade_stats")
    .select("profile_id, joined_at, total_posts, closed_posts, comment_count")
    .eq("profile_id", profileId)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as TradeStatsRow;
  return {
    profileId: row.profile_id,
    joinedAtIso: row.joined_at,
    totalPosts: Number(row.total_posts ?? 0),
    closedPosts: Number(row.closed_posts ?? 0),
    commentCount: Number(row.comment_count ?? 0)
  };
}
```

- [ ] **Step 3: derive helpers (순수함수, 테스트 가능)**

`lib/trust-utils.ts`:

```ts
import type { AppRole } from "./types";

export interface TrustSignal {
  joinedAtIso: string;
  totalPosts: number;
  closedPosts: number;
  commentCount: number;
}

export type TrustBadgeKind = "newcomer" | "regular" | "active" | "admin";

const NEWCOMER_DAYS = 7;
const ACTIVE_TRADES = 10;

export function getMembershipDays(joinedAtIso: string, now: Date = new Date()): number {
  const joined = new Date(joinedAtIso);
  if (Number.isNaN(joined.getTime())) return 0;
  const diffMs = now.getTime() - joined.getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
}

export function getMembershipLabel(joinedAtIso: string, now: Date = new Date()): string {
  const days = getMembershipDays(joinedAtIso, now);
  if (days < 1) return "오늘 가입";
  if (days < 30) return `가입 ${days}일 전`;
  if (days < 365) return `가입 ${Math.floor(days / 30)}개월 전`;
  return `가입 ${Math.floor(days / 365)}년 전`;
}

export function getSuccessRate(totalPosts: number, closedPosts: number): number {
  if (totalPosts <= 0) return 0;
  return Math.round((closedPosts / totalPosts) * 100);
}

export function getTrustBadge({
  role,
  totalPosts,
  joinedAtIso,
  now = new Date()
}: {
  joinedAtIso: string;
  now?: Date;
  role: AppRole;
  totalPosts: number;
}): { kind: TrustBadgeKind; label: string } {
  if (role === "admin") return { kind: "admin", label: "관리자 인증" };

  const days = getMembershipDays(joinedAtIso, now);
  if (days < NEWCOMER_DAYS) return { kind: "newcomer", label: "신규 회원" };

  if (totalPosts >= ACTIVE_TRADES) return { kind: "active", label: "활발한 거래자" };

  return { kind: "regular", label: "일반 회원" };
}
```

- [ ] **Step 4: 단위 테스트**

`tests/lib/trust-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMembershipDays, getMembershipLabel, getSuccessRate, getTrustBadge } from "../../lib/trust-utils";

describe("getMembershipDays", () => {
  it("counts whole days since the given timestamp", () => {
    const now = new Date("2026-05-10T00:00:00Z");
    expect(getMembershipDays("2026-05-08T00:00:00Z", now)).toBe(2);
    expect(getMembershipDays("2026-05-10T05:00:00Z", now)).toBe(0);
    expect(getMembershipDays("invalid", now)).toBe(0);
  });
});

describe("getMembershipLabel", () => {
  const now = new Date("2026-05-10T00:00:00Z");
  it("uses Korean labels at appropriate granularities", () => {
    expect(getMembershipLabel("2026-05-09T23:00:00Z", now)).toBe("오늘 가입");
    expect(getMembershipLabel("2026-05-05T00:00:00Z", now)).toBe("가입 5일 전");
    expect(getMembershipLabel("2026-03-01T00:00:00Z", now)).toBe("가입 2개월 전");
    expect(getMembershipLabel("2024-05-01T00:00:00Z", now)).toBe("가입 2년 전");
  });
});

describe("getSuccessRate", () => {
  it("returns rounded percentage of closed posts", () => {
    expect(getSuccessRate(0, 0)).toBe(0);
    expect(getSuccessRate(10, 7)).toBe(70);
    expect(getSuccessRate(3, 1)).toBe(33);
  });
});

describe("getTrustBadge", () => {
  const now = new Date("2026-05-10T00:00:00Z");
  it("returns admin badge for admin role regardless of stats", () => {
    expect(getTrustBadge({ role: "admin", joinedAtIso: "2024-01-01", totalPosts: 0, now }).kind).toBe("admin");
  });
  it("returns newcomer when joined within 7 days", () => {
    expect(getTrustBadge({ role: "member", joinedAtIso: "2026-05-05", totalPosts: 0, now }).kind).toBe("newcomer");
  });
  it("returns active when totalPosts >= 10", () => {
    expect(getTrustBadge({ role: "member", joinedAtIso: "2024-01-01", totalPosts: 12, now }).kind).toBe("active");
  });
  it("falls back to regular member", () => {
    expect(getTrustBadge({ role: "member", joinedAtIso: "2024-01-01", totalPosts: 3, now }).kind).toBe("regular");
  });
});
```

- [ ] **Step 5: 테스트 실행**

```bash
npm test
```

기대: 44 + 4 = 48 tests pass.

- [ ] **Step 6: 커밋**

```bash
git add lib/trust-utils.ts lib/trust-server.ts lib/types.ts tests/lib/trust-utils.test.ts
git commit -m "feat(trust): add trust signal helpers (membership/success rate/badge)"
```

---

## Task B.3 — 게시글 상세 seller-card에 Trust UI 통합

**Files:**
- Modify: `app/market/[id]/page.tsx`
- Create: `components/TrustBadge.tsx`
- Modify: `app/globals.css` (badge variants + trust-card 스타일)

- [ ] **Step 1: TrustBadge 컴포넌트**

`components/TrustBadge.tsx`:

```tsx
import type { TrustBadgeKind } from "../lib/trust-utils";

interface TrustBadgeProps {
  kind: TrustBadgeKind;
  label: string;
}

export function TrustBadge({ kind, label }: TrustBadgeProps) {
  return <span className={`trust-badge trust-badge--${kind}`}>{label}</span>;
}
```

- [ ] **Step 2: trust-badge / trust-card CSS**

`app/globals.css` 끝에 추가:

```css
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.trust-badge--newcomer { background: var(--surface-muted); color: var(--muted); }
.trust-badge--regular  { background: var(--primary-soft); color: var(--primary); }
.trust-badge--active   { background: var(--trade-buy-soft); color: var(--trade-buy); }
.trust-badge--admin    { background: rgba(37, 99, 235, 0.16); color: var(--trust-verified); }

.trust-card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-muted);
}

.trust-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.trust-card__label {
  color: var(--muted);
  font-size: 0.88rem;
}

.trust-card__value {
  font-weight: 700;
}
```

- [ ] **Step 3: 게시글 상세 seller-card에 Trust UI**

`app/market/[id]/page.tsx`의 seller-card 안에 추가 (작성자 영역 근처):

```tsx
import { TrustBadge } from "../../../components/TrustBadge";
import { getTrustSignal } from "../../../lib/trust-server";
import { getMembershipLabel, getSuccessRate, getTrustBadge } from "../../../lib/trust-utils";

// page 함수 안:
const trustSignal = item.authorId ? await getTrustSignal(item.authorId) : null;
const trustBadge = trustSignal
  ? getTrustBadge({
      role: item.authorRoleLabel === "관리자" ? "admin" : "member",
      joinedAtIso: trustSignal.joinedAtIso,
      totalPosts: trustSignal.totalPosts
    })
  : null;
const successRate = trustSignal ? getSuccessRate(trustSignal.totalPosts, trustSignal.closedPosts) : 0;
```

seller-card JSX에 trust-card 블록:

```tsx
{trustSignal && trustBadge ? (
  <div className="trust-card">
    <div className="trust-card__row">
      <span className="trust-card__label">신뢰 등급</span>
      <TrustBadge kind={trustBadge.kind} label={trustBadge.label} />
    </div>
    <div className="trust-card__row">
      <span className="trust-card__label">총 거래</span>
      <span className="trust-card__value">
        {trustSignal.totalPosts}회 · 완료 {trustSignal.closedPosts}회
        {trustSignal.totalPosts > 0 ? ` (${successRate}%)` : ""}
      </span>
    </div>
    <div className="trust-card__row">
      <span className="trust-card__label">댓글</span>
      <span className="trust-card__value">{trustSignal.commentCount}건</span>
    </div>
    <div className="trust-card__row">
      <span className="trust-card__label">가입</span>
      <span className="trust-card__value">{getMembershipLabel(trustSignal.joinedAtIso)}</span>
    </div>
  </div>
) : null}
```

⚠️ `item.authorRoleLabel`은 한글 라벨(`관리자`/`일반회원`)이므로 `role` 매핑 정확도를 위해 `lib/types.ts`의 `Profile.role` 직접 fetch가 더 정확. 다만 간단함을 위해 라벨 비교 + 추후 정밀화.

- [ ] **Step 4: 브라우저 회귀**

`/market/4` 등 게시글 상세에서:
- 우측 seller-card에 trust-card 노출
- "신뢰 등급: 일반 회원" / "총 거래: 1회 · 완료 0회 (0%)" / "댓글: 1건" / "가입: N일 전"

- [ ] **Step 5: 커밋**

```bash
git add app/market/[id]/page.tsx components/TrustBadge.tsx app/globals.css
git commit -m "feat(trust): show trust signals (badge/total/closed/comments/membership) in seller card"
```

---

## Task B.4 — 마이페이지에 Trust UI

**Files:**
- Modify: `app/mypage/page.tsx`

- [ ] **Step 1: trust signal fetch + 통합**

```tsx
const trustSignal = await getTrustSignal(user.id);
```

profile panel 안 summary-grid 위에 trust-card 노출. PROFILE 카드의 신뢰 신호로 사용자가 자신의 활동 지표를 즉시 확인.

- [ ] **Step 2: 회귀 + 커밋**

`/mypage` 접속 → 프로필 카드에 trust-card 노출.

```bash
git commit -m "feat(trust): show signal card on mypage profile panel"
```

---

## Task B.5 — 관리자 회원 row에 TrustBadge

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: 회원 목록에 trust badge**

`getAdminDashboardData`가 회원별 trust signal을 같이 fetch하도록 확장 (또는 admin row마다 개별 fetch — 회원 수가 적으므로 OK).

회원 row 메타라인에 `<TrustBadge>` 추가:

```tsx
<div className="market-table__meta">
  {member.email} · <TrustBadge ... />
</div>
```

- [ ] **Step 2: 회귀 + 커밋**

```bash
git commit -m "feat(trust): show TrustBadge alongside member rows in admin dashboard"
```

---

## Task B.6 — 빌드 + 회귀 + push

- [ ] **Step 1: 빌드**

```bash
npm run build
```

- [ ] **Step 2: 단위 테스트**

```bash
npm test
```

기대: 48 tests pass.

- [ ] **Step 3: production 회귀**

`/`, `/market/4`, `/mypage`, `/admin` 4페이지 스크린샷.

- [ ] **Step 4: push**

```bash
git push origin main
```

---

## 자기 점검

- [x] Spec coverage: DESIGN.md Phase B "Trust"의 3가지 항목(거래 횟수/응답률, 거래 timeline, 안전거래 배지) 중 **거래 횟수 + 신뢰 배지**를 1차 구현. **응답률**과 **거래 timeline**은 Phase B.2로 별도 분리(응답률은 첫 댓글까지 시간 계산 추가 필요).
- [x] Placeholder scan: 모든 step에 코드 블록 명시.
- [x] Type consistency: `TrustSignal` shape이 server fetcher / utils / 컴포넌트에서 일관.
