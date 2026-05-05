-- /staff/games + /market hub의 게임별 카운트 집계용 view.
-- 기존: 모든 market_posts (game_id, status) 행을 fetch 후 JS에서 reduce.
-- 신규: SQL GROUP BY로 28행만 반환 → 1만 거래글 시점에서도 응답 8KB 미만.

create view public.game_post_counts as
select
  game_id,
  count(*) as total_count,
  count(*) filter (where status = 'open') as open_count,
  count(*) filter (where status = 'closed') as closed_count
from public.market_posts
group by game_id;

-- 공개 view — RLS는 underlying market_posts 정책을 따른다 (이미 public SELECT).
grant select on public.game_post_counts to anon, authenticated;
