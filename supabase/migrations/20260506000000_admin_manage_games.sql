-- /staff/games 콘솔에서 admin이 게시판 추가/수정/삭제할 수 있도록 RLS 정책 보강.
-- 기존 정책: SELECT 공개 + service_role ALL.
-- 새 정책: 활성 admin profile은 INSERT/UPDATE/DELETE 가능 (market_posts와 동일 패턴).

create policy "admins can insert games"
  on public.games
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "admins can update games"
  on public.games
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "admins can delete games"
  on public.games
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin' and status = 'active'
    )
  );
