# Phase B.2 — Response Signal + Trade Timeline + Safety Badges

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** Phase B.1의 trust signal을 보강한다. ① 응답성 metric (단순화: 최근 30일 활동) ② 게시글 상세에 거래 단계 timeline ③ 안전거래 안내를 동적 체크리스트로.

**Architecture:**
1. **B.2.1 응답성 metric** — `profile_trade_stats` view를 `profile_activity_stats`로 확장하거나 별도 view. 최근 30일 게시글 수, 댓글 수 추가.
2. **B.2.2 거래 timeline** — `<TradeTimeline>` 컴포넌트. 등록/문의/거래중/거래완료 4단계 + 현재 단계 highlight + 각 단계별 timestamp.
3. **B.2.3 안전거래 체크리스트** — 게시글 상세의 정적 텍스트를 거래 상태 기반 동적 체크 list로 변환.

각 task별 단위 테스트 + 브라우저 회귀 + commit.

---

## Task B.2.1 — 응답성 metric (최근 30일 활동)

### 정직한 한정

진짜 "응답률"(작성자가 받은 댓글에 답글 단 비율)은 본 데이터 모델로 측정 불가 — comment thread/parent_id 필드 없음. 대신 **최근 30일 활동량**으로 대체:
- `recent_posts_30d`: 작성자가 최근 30일에 등록한 게시글 수
- `recent_comments_30d`: 작성자가 최근 30일에 작성한 댓글 수

이 두 지표는 "이 사람이 얼마나 활발한가"를 보여주며, 거래 응답성의 *근사 신호*다.

**Files:**
- Create: `supabase/migrations/20260504000003_profile_activity.sql`
- Modify: `lib/trust-server.ts`, `lib/trust-utils.ts`, `lib/types.ts`
- Modify: `app/market/[id]/page.tsx`, `app/mypage/page.tsx`
- Modify: `tests/lib/trust-utils.test.ts`

### Steps

- [ ] **Step 1: view 확장**

```sql
-- supabase/migrations/20260504000003_profile_activity.sql
create or replace view public.profile_trade_stats as
select
  p.id as profile_id,
  p.created_at as joined_at,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id), 0)::bigint as total_posts,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id and mp.status = 'closed'), 0)::bigint as closed_posts,
  coalesce((select count(*) from public.market_comments mc where mc.author_id = p.id), 0)::bigint as comment_count,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id and mp.created_at >= now() - interval '30 days'), 0)::bigint as recent_posts_30d,
  coalesce((select count(*) from public.market_comments mc where mc.author_id = p.id and mc.created_at >= now() - interval '30 days'), 0)::bigint as recent_comments_30d
from public.profiles p;

grant select on public.profile_trade_stats to anon, authenticated;
```

- [ ] **Step 2: TrustSignal 타입 + fetcher 확장**

`lib/types.ts`에 `recentPosts30d`, `recentComments30d` 추가.

`lib/trust-server.ts`의 `TradeStatsRow`와 매핑 코드 확장.

- [ ] **Step 3: utils helper**

```ts
// lib/trust-utils.ts
export function getActivityLabel(recentPosts: number, recentComments: number): string {
  const total = recentPosts + recentComments;
  if (total === 0) return "최근 활동 없음";
  if (total < 3) return `최근 30일 ${total}회 활동`;
  if (total < 10) return `최근 30일 ${total}회 활동 (활발)`;
  return `최근 30일 ${total}회 활동 (매우 활발)`;
}
```

- [ ] **Step 4: 단위 테스트**

```ts
describe("getActivityLabel", () => {
  it("describes total recent activity in Korean", () => {
    expect(getActivityLabel(0, 0)).toBe("최근 활동 없음");
    expect(getActivityLabel(1, 0)).toBe("최근 30일 1회 활동");
    expect(getActivityLabel(3, 2)).toBe("최근 30일 5회 활동 (활발)");
    expect(getActivityLabel(15, 0)).toBe("최근 30일 15회 활동 (매우 활발)");
  });
});
```

- [ ] **Step 5: UI**

게시글 상세 trust-card에 "최근 활동" 행 추가:

```tsx
<div className="trust-card__row">
  <span className="trust-card__label">최근 활동</span>
  <span className="trust-card__value">
    {getActivityLabel(trustSignal.recentPosts30d, trustSignal.recentComments30d)}
  </span>
</div>
```

마이페이지 trust-card에도 동일.

- [ ] **Step 6: db reset + bootstrap + 회귀**

```bash
echo Y | powershell.exe -Command "supabase db reset"
npm run supabase:bootstrap
```

`/market/1` 작성자 카드에 "최근 30일 N회 활동" 노출.

- [ ] **Step 7: 커밋**

```bash
git commit -m "feat(trust): add recent activity (30d) metric to trust signal"
```

---

## Task B.2.2 — 거래 timeline 컴포넌트

### 모델

거래는 4단계 lifecycle:
1. **등록** (게시글 created_at)
2. **문의** (첫 댓글 시점, 댓글 N개 누적)
3. **거래중** (status = open, 마지막 댓글 후)
4. **거래완료** (status = closed, closed_at)

각 단계는 *현재* / *완료* / *대기* 상태.

**Files:**
- Create: `components/TradeTimeline.tsx`
- Modify: `app/globals.css` (timeline 스타일)
- Modify: `lib/types.ts` (`MarketPost`에 `closedAtIso`, `firstCommentAtIso` 추가)
- Modify: `lib/market-server.ts` (select 절 + record map 확장)
- Modify: `lib/market-utils.ts` (`mapMarketPostRecord` 갱신, derive helper)
- Modify: `app/market/[id]/page.tsx` (timeline 통합)

### Steps

- [ ] **Step 1: MarketPost 타입에 timestamp 추가**

```ts
// lib/types.ts
export interface MarketPost {
  // ...
  closedAtIso?: string;
  firstCommentAtIso?: string;
}
```

- [ ] **Step 2: market-server.ts select 확장**

```ts
const MARKET_POST_DETAIL_SELECT = `
  ...
  closed_at,
  ...
`;
```

`market_comments` 안에서 첫 댓글의 created_at을 추출하려면 array sort 후 [0]. mapMarketPostRecord에서 처리:

```ts
const sortedComments = (record.market_comments ?? []).slice().sort((a, b) =>
  a.created_at.localeCompare(b.created_at)
);
const firstCommentAtIso = sortedComments[0]?.created_at;
```

- [ ] **Step 3: lib/market-utils.ts에 derive helper**

```ts
export type TradeTimelineStage = "registered" | "inquired" | "active" | "closed";

export interface TradeTimelineState {
  stage: TradeTimelineStage;
  steps: Array<{
    key: TradeTimelineStage;
    label: string;
    timestamp?: string;
    status: "done" | "current" | "pending";
  }>;
}

export function getTradeTimeline({
  status,
  createdAtIso,
  firstCommentAtIso,
  closedAtIso,
  commentCount
}: {
  closedAtIso?: string;
  commentCount: number;
  createdAtIso?: string;
  firstCommentAtIso?: string;
  status: MarketStatus;
}): TradeTimelineState {
  const isClosed = status === "closed";
  const hasInquiry = commentCount > 0;
  const stage: TradeTimelineStage = isClosed
    ? "closed"
    : hasInquiry
    ? "active"
    : commentCount === 0
    ? "registered"
    : "inquired";

  const steps: TradeTimelineState["steps"] = [
    { key: "registered", label: "등록", timestamp: createdAtIso, status: "done" },
    {
      key: "inquired",
      label: `문의 ${commentCount}건`,
      timestamp: firstCommentAtIso,
      status: hasInquiry ? "done" : (stage === "registered" ? "current" : "pending")
    },
    {
      key: "active",
      label: "거래중",
      status: !isClosed && hasInquiry ? "current" : isClosed ? "done" : "pending"
    },
    {
      key: "closed",
      label: "거래완료",
      timestamp: closedAtIso,
      status: isClosed ? "done" : "pending"
    }
  ];

  return { stage, steps };
}
```

- [ ] **Step 4: 단위 테스트**

`getTradeTimeline` 4가지 케이스 (등록 직후 / 문의만 / 거래중 / 거래완료).

- [ ] **Step 5: TradeTimeline 컴포넌트**

```tsx
// components/TradeTimeline.tsx
import { getTradeTimeline, type TradeTimelineState } from "../lib/market-utils";

interface TradeTimelineProps {
  state: TradeTimelineState;
}

export function TradeTimeline({ state }: TradeTimelineProps) {
  return (
    <ol className="trade-timeline">
      {state.steps.map((step) => (
        <li key={step.key} className={`trade-timeline__step trade-timeline__step--${step.status}`}>
          <span className="trade-timeline__dot" aria-hidden="true" />
          <span className="trade-timeline__label">{step.label}</span>
          {step.timestamp ? (
            <span className="trade-timeline__time">{formatRelativeTime(step.timestamp)}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 6: globals.css 스타일**

```css
.trade-timeline {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  list-style: none;
}

.trade-timeline__step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
}

.trade-timeline__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--line);
}

.trade-timeline__step--done .trade-timeline__dot { background: var(--status-open); }
.trade-timeline__step--current .trade-timeline__dot { background: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.trade-timeline__step--pending .trade-timeline__dot { background: var(--surface); border: 2px solid var(--line); }

.trade-timeline__label {
  font-weight: 700;
  font-size: 0.92rem;
}

.trade-timeline__step--pending .trade-timeline__label { color: var(--muted); font-weight: 500; }

.trade-timeline__time {
  color: var(--muted);
  font-size: 0.84rem;
}
```

- [ ] **Step 7: 게시글 상세에 통합**

`app/market/[id]/page.tsx`의 detail-summary 안 거래 댓글 섹션 위에 TradeTimeline 삽입:

```tsx
<div className="detail-box">
  <h3>거래 진행 상태</h3>
  <TradeTimeline state={getTradeTimeline({ ... })} />
</div>
```

- [ ] **Step 8: 회귀 + 커밋**

`/market/1` (open) 와 `/market/3` (closed) 모두 timeline 정상 노출.

```bash
git commit -m "feat(detail): trade timeline (registered/inquired/active/closed) on listing detail"
```

---

## Task B.2.3 — 안전거래 체크리스트 동적화

현재 게시글 상세의 "안전거래 안내"는 **정적 4개 텍스트**. 이를 게시글 상태에 따라 자동 체크되는 인터랙티브 체크리스트로 전환.

**Files:**
- Modify: `app/market/[id]/page.tsx`
- Modify: `app/globals.css` (safety-checklist 스타일)

### Steps

- [ ] **Step 1: 체크리스트 모델**

```ts
function getSafetyChecks({
  authorId,
  viewerId,
  hasInquiry,
  status
}: {
  authorId?: string;
  hasInquiry: boolean;
  status: MarketStatus;
  viewerId?: string;
}) {
  return [
    {
      key: "verify-info",
      label: "서버 / 캐릭터 / 수량 정보를 다시 확인",
      checked: false
    },
    {
      key: "comment-thread",
      label: "댓글로 거래 조건을 기록",
      checked: hasInquiry
    },
    {
      key: "in-progress",
      label: "거래 진행 중 (글이 거래중 상태)",
      checked: status === "open"
    },
    {
      key: "completed",
      label: "거래완료 처리",
      checked: status === "closed"
    }
  ];
}
```

- [ ] **Step 2: 안전거래 섹션을 체크리스트로 교체**

기존 detail-box "안전거래 안내" 영역을:

```tsx
<div className="detail-box">
  <h3>안전거래 체크</h3>
  <ul className="safety-checklist">
    {safetyChecks.map((check) => (
      <li key={check.key} className={`safety-checklist__item${check.checked ? " safety-checklist__item--done" : ""}`}>
        <span className="safety-checklist__mark" aria-hidden="true">{check.checked ? "✓" : "○"}</span>
        <span>{check.label}</span>
      </li>
    ))}
  </ul>
</div>
```

- [ ] **Step 3: globals.css 스타일**

```css
.safety-checklist {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.safety-checklist__item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-3);
  color: var(--muted);
}

.safety-checklist__mark {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--surface-muted);
  font-weight: 700;
  font-size: 0.86rem;
  color: var(--muted);
}

.safety-checklist__item--done {
  color: var(--text);
}

.safety-checklist__item--done .safety-checklist__mark {
  background: var(--trade-buy-soft);
  color: var(--trade-buy);
}
```

- [ ] **Step 4: 회귀 + 커밋**

`/market/1` (open, 댓글 1) → 1, 2, 3 체크 / 4 미체크.
`/market/3` (closed) → 모두 체크.

```bash
git commit -m "feat(detail): turn safety guidance into a status-aware checklist"
```

---

## Task B.2.4 — 빌드 + push

- [ ] `npm test` 모두 PASS
- [ ] `npm run build` exit 0
- [ ] `/`, `/market/1`, `/market/3`, `/mypage`, `/admin` 5페이지 회귀
- [ ] `git push origin main`
