-- profiles.created_at은 거래 신뢰 신호("가입 N일 전")에 필요하지만
-- anon SELECT 권한에서 빠져 있어 비로그인 사용자가 작성자 카드에서 조회 불가.
-- 닉네임/role과 동일 수준으로 공개 — PII 아님.
grant select (id, nickname, role, created_at) on public.profiles to anon;

-- 게시글 작성자별 집계 view.
-- view는 base table의 RLS를 그대로 상속받으므로 별도 정책 불필요.
-- market_posts/market_comments는 anon SELECT 가능, profiles는 본 마이그레이션에서 created_at까지 anon 노출.
create or replace view public.profile_trade_stats as
select
  p.id as profile_id,
  p.created_at as joined_at,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id), 0)::bigint as total_posts,
  coalesce((select count(*) from public.market_posts mp where mp.author_id = p.id and mp.status = 'closed'), 0)::bigint as closed_posts,
  coalesce((select count(*) from public.market_comments mc where mc.author_id = p.id), 0)::bigint as comment_count
from public.profiles p;

grant select on public.profile_trade_stats to anon, authenticated;
