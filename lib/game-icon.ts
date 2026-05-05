/**
 * Supabase Storage `game-icons` 버킷의 public URL을 생성한다.
 *
 * 사용 흐름:
 *   1. `npm run supabase:upload-icons` 로 public/icons/games/*.png 업로드
 *   2. games.icon_path 컬럼이 파일명({slug}.png) 으로 채워짐 (lib/market-server.mapGameRow)
 *   3. 컴포넌트에서 game.iconPath 또는 game.slug 를 이 helper에 넘겨 URL 획득
 *   4. <img src> 로 노출
 *
 * iconPath가 비어있거나 NEXT_PUBLIC_SUPABASE_URL이 누락되면 null을 반환 — 그 경우
 * 호출자는 brand-color 텍스트 태그만 노출하면 된다(현재 동작과 동일).
 */

const FALLBACK_LOCAL_URL = "http://127.0.0.1:54321";
const ICONS_BUCKET = "game-icons";

function getStorageBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    FALLBACK_LOCAL_URL
  );
}

/**
 * games.icon_path 값을 받아 public URL을 반환.
 * @example getGameIconUrl("maplestory.png") → "http://.../storage/v1/object/public/game-icons/maplestory.png"
 */
export function getGameIconUrl(iconPath: string | null | undefined): string | null {
  if (!iconPath) {
    return null;
  }

  const baseUrl = getStorageBaseUrl();
  return `${baseUrl}/storage/v1/object/public/${ICONS_BUCKET}/${iconPath}`;
}

/**
 * slug만 있는 컨텍스트(ListingGrid, MarketTable 등) 용. 아이콘 파일명이
 * `{slug}.png` 컨벤션을 따르므로 슬러그에서 파일명을 유도한다. 만약 이후
 * 컨벤션이 깨지면 호출 측에서 game.iconPath를 직접 넘겨 본 helper 대신
 * getGameIconUrl을 사용해야 한다.
 */
export function getGameIconUrlBySlug(slug: string | null | undefined): string | null {
  if (!slug) {
    return null;
  }

  return getGameIconUrl(`${slug}.png`);
}
