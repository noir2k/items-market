# 게임 아이콘 업로드 가이드 (사용자 협력 필요)

> 게임 아이콘은 각 게임사의 저작권이 있어 자동 다운로드 대신 **사용자가 직접 공식 소스에서 받아 Supabase Storage에 업로드**해야 합니다. 본 문서는 그 절차입니다.

## 1. 필요한 아이콘 사양

- **포맷**: PNG (투명 배경 권장)
- **크기**: 정사각형 64×64 px (또는 128×128 px)
- **파일명**: `{slug}.png` — 예: `maplestory.png`, `lostark.png`
- **저작권**: 게임사 공식 로고 또는 CC0/MIT 자산만 사용

## 2. 아이콘이 필요한 게임 목록

`games` 테이블에 등록된 16개 게임 (slug 기준):

| Slug | 한국어명 | 추천 소스 |
|---|---|---|
| `maplestory` | 메이플스토리 | maplestory.nexon.com 공식 |
| `lineagem` | 리니지M | lineagem.plaync.com |
| `lineagew` | 리니지W | lineagew.plaync.com |
| `lineage2m` | 리니지2M | lineage2m.plaync.com |
| `lostark` | 로스트아크 | lostark.game.onstove.com |
| `dnf` | 던전앤파이터 | df.nexon.com |
| `fc-online` | FC Online | fconline.nexon.com |
| `aion` | 아이온 | aion.plaync.com |
| `bdo` | 검은사막 | naeu.playblackdesert.com |
| `wow` | 월드 오브 워크래프트 | worldofwarcraft.blizzard.com |
| `odin` | 오딘 | odin.kakaogames.com |
| `genshin` | 원신 | hoyoverse.com |
| `arknights` | 명일방주 | arknights.global |
| `valorant` | 발로란트 | playvalorant.com |
| `overwatch` | 오버워치 2 | overwatch.blizzard.com |
| `diablo4` | 디아블로 IV | diablo4.blizzard.com |

## 3. Storage bucket 생성 (1회)

Supabase Studio (`http://127.0.0.1:54323` 로컬 / 원격은 dashboard.supabase.com) 접속:

1. 좌측 메뉴 → **Storage** 클릭
2. **New bucket** 클릭
3. 설정:
   - Name: `game-icons`
   - Public bucket: **체크** (아이콘은 공개)
   - File size limit: 1 MB
   - Allowed MIME types: `image/png, image/jpeg, image/webp`
4. **Create**

또는 SQL로:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('game-icons', 'game-icons', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
```

## 4. 아이콘 업로드

Storage UI에서:
1. `game-icons` 버킷 선택
2. **Upload file** → 준비한 `{slug}.png` 일괄 업로드
3. 업로드 후 각 파일에서 **Get URL** 또는 path 확인 — 형식: `game-icons/{slug}.png`

## 5. games 테이블에 icon_path 등록

```sql
update public.games set icon_path = 'maplestory.png' where slug = 'maplestory';
update public.games set icon_path = 'lineagem.png'   where slug = 'lineagem';
update public.games set icon_path = 'lineagew.png'   where slug = 'lineagew';
update public.games set icon_path = 'lineage2m.png'  where slug = 'lineage2m';
update public.games set icon_path = 'lostark.png'    where slug = 'lostark';
update public.games set icon_path = 'dnf.png'        where slug = 'dnf';
update public.games set icon_path = 'fc-online.png'  where slug = 'fc-online';
update public.games set icon_path = 'aion.png'       where slug = 'aion';
update public.games set icon_path = 'bdo.png'        where slug = 'bdo';
update public.games set icon_path = 'wow.png'        where slug = 'wow';
update public.games set icon_path = 'odin.png'       where slug = 'odin';
update public.games set icon_path = 'genshin.png'    where slug = 'genshin';
update public.games set icon_path = 'arknights.png'  where slug = 'arknights';
update public.games set icon_path = 'valorant.png'   where slug = 'valorant';
update public.games set icon_path = 'overwatch.png'  where slug = 'overwatch';
update public.games set icon_path = 'diablo4.png'    where slug = 'diablo4';
```

## 6. 코드에서 아이콘 URL 가져오기

`lib/game-icon.ts`(추후 구현 예정)에서 다음 형식의 public URL을 반환:

```
http://127.0.0.1:54321/storage/v1/object/public/game-icons/{icon_path}
```

또는 Supabase JS client `supabase.storage.from('game-icons').getPublicUrl(iconPath)`.

`GameHubCard` / `GameSubNav` / `game-tag` 등에 `<img>` 요소로 노출.

## 7. 미설정 fallback

`icon_path`가 비어 있으면 현재 brand color tag만 노출 (지금 동작과 동일). 즉 아이콘 업로드 없이도 앱은 동작.

---

**우선순위**: 인기 게임(메이플스토리, 리니지M, 로스트아크, FC Online) 4개부터 업로드해도 충분합니다. 나머지는 점진 추가.
