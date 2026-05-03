-- Public read of nickname/role for unauthenticated visitors so market posts
-- can render the author label without forcing login.
grant select (id, nickname, role) on public.profiles to anon;

drop policy if exists "authenticated users can read profiles" on public.profiles;

create policy "profiles are readable by everyone"
on public.profiles
for select
using (true);
