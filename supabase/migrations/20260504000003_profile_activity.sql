-- profile_trade_stats view 확장: 최근 30일 활동량 추가.
-- 진짜 "응답률"(받은 댓글 대비 답글 비율)은 본 schema로 측정 불가
-- (comment thread 없음). 대신 작성자의 최근 30일 활동량으로 근사.
create or replace view public.profile_trade_stats as
select
  p.id as profile_id,
  p.created_at as joined_at,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id), 0)::bigint as total_posts,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id and mp.status = 'closed'), 0)::bigint as closed_posts,
  coalesce((select count(*) from public.market_comments mc where mc.author_id = p.id), 0)::bigint as comment_count,
  coalesce((
    select count(*) from public.market_posts mp
    where mp.author_id = p.id and mp.created_at >= now() - interval '30 days'
  ), 0)::bigint as recent_posts_30d,
  coalesce((
    select count(*) from public.market_comments mc
    where mc.author_id = p.id and mc.created_at >= now() - interval '30 days'
  ), 0)::bigint as recent_comments_30d
from public.profiles p;

grant select on public.profile_trade_stats to anon, authenticated;
