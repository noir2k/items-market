insert into public.games (slug, name, sort_order)
values
  ('maplestory', '메이플스토리', 10),
  ('lineagem', '리니지M', 20),
  ('fc-online', 'FC Online', 30),
  ('lostark', '로스트아크', 40),
  ('dnf', '던전앤파이터', 50),
  ('aion', '아이온', 60)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true;
