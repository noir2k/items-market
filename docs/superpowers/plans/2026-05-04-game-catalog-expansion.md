# Game Catalog Expansion — Genre / Brand Color / Seed / Icons

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** 게임 카탈로그를 prod-grade로 확장. 장르 분류 + 정확한 brand color + 풍부한 시드 + 아이콘 storage.

**Architecture:**
- DB: `games` 테이블에 `genre`, `icon_path` 컬럼 추가
- 시드: 한국 사용자 친숙한 12+ 게임, 30+ 게시물
- UI: Hub 카드 단순화(거래중만), 장르별 섹션 그룹화
- Storage: Supabase Storage bucket + 사용자 협력 가이드

---

## Task G.1 — DB schema (genre + icon_path)

**Files:** `supabase/migrations/20260504000004_game_genre_icon.sql`

```sql
-- Game genre enum + icon_path column
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
```

## Task G.2 — 게임 카탈로그 시드 확장

`lib/supabase-local.ts` `buildDemoMarketSeed().games` 신규 추가. 기존 seed.sql에는 6개만 있음 — 신규 마이그레이션으로 12개 더 추가.

**Files:** `supabase/migrations/20260504000005_expand_game_catalog.sql`

추가 게임 (sort_order는 인기순):
- **MMORPG (PC)**: 메이플스토리, 로스트아크, 던전앤파이터, 검은사막, 와우, 아이온
- **MMORPG (모바일)**: 리니지M, 리니지W, 리니지2M, 오딘
- **RPG 모바일**: 원신, 명일방주
- **SPORTS**: FC Online
- **FPS**: 발로란트, 오버워치
- **기타**: 디아블로 IV

총 16개. 각 게임 brand color는 `app/globals.css`에 추가.

## Task G.3 — 게임 brand color 토큰 + 장르 색

```css
:root {
  /* 1순위: 정확 brand */
  --game-maple: #ff8a00;        /* MapleStory orange */
  --game-lineage: #c8102e;      /* Lineage red */
  --game-lostark: #d4af37;      /* LostArk gold */
  --game-fc: #00aeef;           /* EA FC blue */
  --game-dnf: #f6921e;          /* DnF orange */
  --game-bdo: #1a1a1a;          /* 검은사막 black */
  --game-wow: #1565c0;          /* WoW blue */
  --game-aion: #5b9bd5;         /* Aion 천사 blue */
  --game-genshin: #4a90e2;      /* 원신 hoyoverse blue */
  --game-arknights: #2c2c2c;    /* 명일방주 dark */
  --game-valorant: #ff4655;     /* Valorant red */
  --game-overwatch: #f99e1a;    /* Overwatch orange */
  --game-diablo: #b00020;       /* Diablo blood red */
  --game-odin: #2f4858;         /* 오딘 navy */

  /* 2순위: 장르 색 (icon 없을 때 fallback) */
  --genre-mmorpg-pc: #6366f1;
  --genre-mmorpg-mobile: #ec4899;
  --genre-rpg-mobile: #8b5cf6;
  --genre-sports: #10b981;
  --genre-fps: #ef4444;
  --genre-moba: #f59e0b;
  --genre-other: #64748b;
}
```

## Task G.4 — 게시물 시드 보강 (실제 프로덕션 느낌)

`scripts/bootstrap-local-supabase.ts`에서 게시물 30+ 개 시드. 다양한 게임/카테고리/가격/조건. 작성자도 다양화 (5-7명 추가).

## Task G.5 — Hub 카드 단순화 + 장르별 섹션

- `GameHubCard`: 4 metric → 1 metric (거래중만), 장르 라벨 chip 추가
- `/market` hub: `<GenreSection genre={...} stats={...} />` 컴포넌트로 장르별 그룹
- 빈 게임은 "곧 오픈" 또는 노출 안 함

## Task G.6 — Supabase Storage + 아이콘 가이드

**Files:**
- 마이그레이션: `supabase/migrations/20260504000006_storage_game_icons.sql` (storage bucket 정책)
- 문서: `docs/game-icons-setup.md` (사용자 협력 가이드)
- lib: `lib/storage.ts` (icon URL helper)

가이드는 사용자가 직접:
1. 게임별 공식 아이콘 64x64 PNG 준비
2. Supabase Studio Storage UI에서 `game-icons` 버킷에 업로드
3. icon_path를 games 테이블에 채움

## Task G.7 — 빌드 + 회귀 + push
