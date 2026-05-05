-- profile_post_summary view에 profile 본체 컬럼 추가.
-- /staff/members SQL 페이징 시 profiles join 없이 view 단일 쿼리로 처리하기 위함.
-- ilike 검색, status 필터, activity 필터(open_post_count/post_count 비교),
-- game_slugs array contains 모두 view 단일 쿼리에서 가능.

create or replace view public.profile_post_summary as
select
  p.id as profile_id,
  count(mp.*) as post_count,
  count(mp.*) filter (where mp.status = 'open') as open_post_count,
  count(mp.*) filter (where mp.status = 'closed') as closed_post_count,
  coalesce(
    array_agg(distinct g.slug) filter (where g.slug is not null),
    array[]::text[]
  ) as game_slugs,
  p.email as profile_email,
  p.nickname as profile_nickname,
  p.role as profile_role,
  p.status as profile_status,
  p.created_at as profile_created_at
from public.profiles p
left join public.market_posts mp on mp.author_id = p.id
left join public.games g on g.id = mp.game_id
group by p.id;

grant select on public.profile_post_summary to anon, authenticated;
