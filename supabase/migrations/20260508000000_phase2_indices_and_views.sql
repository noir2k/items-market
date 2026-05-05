-- Phase 2: 핫 경로 인덱스 + view 확장 + 회원 집계 view.

-- ─────────────────────────────────────────────────────────────────
-- 1) 인덱스 — 대용량 시점에 필수 (현재 60건 시점에는 영향 없음)
-- ─────────────────────────────────────────────────────────────────

-- 보드 페이지 / hub stats / staff posts 정렬용
create index if not exists idx_market_posts_created_at_desc
  on public.market_posts (created_at desc, id);

-- /mypage / 회원별 detail / 회원별 export
create index if not exists idx_market_posts_author_created
  on public.market_posts (author_id, created_at desc);

-- 게임별 보드 + 상태 필터 + 정렬 (compound)
create index if not exists idx_market_posts_game_status_created
  on public.market_posts (game_id, status, created_at desc);

-- ─────────────────────────────────────────────────────────────────
-- 2) game_post_counts view 확장 — sell/buy 카운트 추가
--   /market hub의 listGameBoardStats가 그대로 view에서 받아올 수 있도록
-- ─────────────────────────────────────────────────────────────────

create or replace view public.game_post_counts as
select
  game_id,
  count(*) as total_count,
  count(*) filter (where status = 'open') as open_count,
  count(*) filter (where status = 'closed') as closed_count,
  count(*) filter (where trade_type = 'sell') as sell_count,
  count(*) filter (where trade_type = 'buy') as buy_count
from public.market_posts
group by game_id;

grant select on public.game_post_counts to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────
-- 3) profile_post_summary view — 회원별 통계 + 게임 distinct
--   /staff/members에서 N+1 fetch 대신 한 번에 받아 SQL 페이징 가능
-- ─────────────────────────────────────────────────────────────────

create or replace view public.profile_post_summary as
select
  p.id as profile_id,
  count(mp.*) as post_count,
  count(mp.*) filter (where mp.status = 'open') as open_post_count,
  count(mp.*) filter (where mp.status = 'closed') as closed_post_count,
  coalesce(
    array_agg(distinct g.slug) filter (where g.slug is not null),
    array[]::text[]
  ) as game_slugs
from public.profiles p
left join public.market_posts mp on mp.author_id = p.id
left join public.games g on g.id = mp.game_id
group by p.id;

grant select on public.profile_post_summary to anon, authenticated;
