-- Game catalog: genre 분류 + icon storage path
-- Hub의 장르별 섹션 그룹화 + 아이콘 노출에 사용.

do $$ begin
  create type public.game_genre as enum (
    'mmorpg_pc',
    'mmorpg_mobile',
    'rpg_mobile',
    'action',
    'sports',
    'fps',
    'moba',
    'casual',
    'other'
  );
exception when duplicate_object then null; end $$;

alter table public.games
  add column if not exists genre public.game_genre not null default 'other',
  add column if not exists icon_path text;

-- 기존 6개 게임 장르 매핑
update public.games set genre = 'mmorpg_pc' where slug in ('maplestory', 'lostark', 'dnf', 'aion');
update public.games set genre = 'mmorpg_mobile' where slug in ('lineagem');
update public.games set genre = 'sports' where slug in ('fc-online');

-- anon이 genre/icon_path도 SELECT 할 수 있도록 grant 보강
grant select (id, slug, name, is_active, sort_order, created_at, genre, icon_path) on public.games to anon, authenticated;
