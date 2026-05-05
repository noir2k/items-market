-- 게임 카탈로그 2차 확장 — 클래식 PC, 최신 오픈월드 모바일 RPG, 액션 RPG 시리즈, MOBA 추가.
-- 16개 → 28개로 확장.
-- 기존 카테고리:
--   * PC MMORPG: maplestory, lostark, dnf, aion, bdo, wow + 신규 3
--   * Mobile MMORPG: lineagem, lineagew, lineage2m, odin (변경 없음)
--   * Mobile RPG: genshin, arknights + 신규 4
--   * Action: diablo4 + 신규 4
--   * Sports: fc-online (변경 없음)
--   * FPS: valorant, overwatch (변경 없음)
--   * MOBA: 신규 섹션 1

insert into public.games (slug, name, genre, sort_order)
values
  -- PC MMORPG 클래식 (lineage 시리즈 PC 버전 + 아키에이지)
  ('lineage1',        '리니지1',           'mmorpg_pc', 18),
  ('lineage-classic', '리니지 클래식',      'mmorpg_pc', 19),
  ('lineage2',        '리니지2',           'mmorpg_pc', 23),

  -- Mobile RPG — 최신 오픈월드 / 가챠 RPG 추가
  ('wuwa',            '명조: 워더링 웨이브', 'rpg_mobile', 68),
  ('endfield',        '명일방주: 엔드필드',  'rpg_mobile', 71),
  ('hsr',             '붕괴: 스타레일',     'rpg_mobile', 74),
  ('nikke',           '승리의 여신: 니케',   'rpg_mobile', 76),

  -- Action RPG — POE 시리즈 + 디아블로 구작
  ('poe',             'Path of Exile',     'action', 88),
  ('poe2',            'Path of Exile 2',   'action', 89),
  ('diablo2',         '디아블로 II',         'action', 91),
  ('diablo3',         '디아블로 III',        'action', 92),

  -- MOBA (신규 섹션 — 한국 1위 게임)
  ('lol',             '리그 오브 레전드',    'moba', 100)

on conflict (slug) do update
set
  name = excluded.name,
  genre = excluded.genre,
  sort_order = excluded.sort_order,
  is_active = true;
