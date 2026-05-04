-- 게임 카탈로그 확장 — 한국 사용자 친숙한 16개 인기 게임으로 보강.
-- 기존 6개에 더해 신규 10개 추가. seed.sql과 동일한 upsert 패턴 사용.

insert into public.games (slug, name, genre, sort_order)
values
  -- MMORPG (PC) — 기존 4개 (maplestory/lostark/dnf/aion) + 신규 2개
  ('bdo',           '검은사막',       'mmorpg_pc', 25),
  ('wow',           '월드 오브 워크래프트', 'mmorpg_pc', 28),

  -- MMORPG (모바일) — 기존 1개 (lineagem) + 신규 3개
  ('lineagew',      '리니지W',        'mmorpg_mobile', 22),
  ('lineage2m',     '리니지2M',       'mmorpg_mobile', 24),
  ('odin',          '오딘',           'mmorpg_mobile', 32),

  -- RPG 모바일
  ('genshin',       '원신',           'rpg_mobile', 70),
  ('arknights',     '명일방주',       'rpg_mobile', 72),

  -- FPS
  ('valorant',      '발로란트',       'fps', 80),
  ('overwatch',     '오버워치 2',     'fps', 82),

  -- Action
  ('diablo4',       '디아블로 IV',    'action', 90)

on conflict (slug) do update
set
  name = excluded.name,
  genre = excluded.genre,
  sort_order = excluded.sort_order,
  is_active = true;

-- 기존 6개 sort_order/genre를 prod-grade 인기순으로 재배치.
-- seed.sql은 마이그레이션 후 실행되므로 한 번 더 update해 default 'other'를 덮어쓴다.
update public.games set sort_order = 10, genre = 'mmorpg_pc'     where slug = 'maplestory';
update public.games set sort_order = 15, genre = 'mmorpg_mobile' where slug = 'lineagem';
update public.games set sort_order = 20, genre = 'mmorpg_pc'     where slug = 'lostark';
update public.games set sort_order = 30, genre = 'mmorpg_pc'     where slug = 'dnf';
update public.games set sort_order = 50, genre = 'sports'        where slug = 'fc-online';
update public.games set sort_order = 60, genre = 'mmorpg_pc'     where slug = 'aion';
