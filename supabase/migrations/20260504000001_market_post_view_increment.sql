-- Lightweight RPC for incrementing market_post view count without
-- requiring extra row-level grants for anon/authenticated.
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
