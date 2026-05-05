import { redirect } from "next/navigation";
import { toggleGameActiveAction } from "../actions";
import { listAdminGames } from "../../../lib/admin-server";
import { isAdminProfile } from "../../../lib/auth-utils";
import { getGameIconUrl } from "../../../lib/game-icon";
import { getCurrentProfile } from "../../../lib/supabase/server";
import type { GameGenre } from "../../../lib/types";

export const metadata = {
  title: "게시판 관리 | ITEM ODIN STAFF"
};

const GENRE_LABELS: Record<GameGenre, string> = {
  mmorpg_pc: "PC MMORPG",
  mmorpg_mobile: "모바일 MMORPG",
  rpg_mobile: "모바일 RPG",
  action: "액션 RPG",
  sports: "스포츠",
  fps: "FPS",
  moba: "MOBA",
  casual: "캐주얼",
  other: "기타"
};

export default async function StaffGamesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const games = await listAdminGames();
  const activeCount = games.filter((g) => g.isActive).length;
  const inactiveCount = games.length - activeCount;

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · BOARDS</p>
          <h1>게시판 관리</h1>
          <p>게임 카탈로그를 관리합니다. 노출/숨김 토글로 게시판 활성 상태를 즉시 전환합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {params.message ? (
            <div className="empty-state empty-state--compact">
              <strong>{params.message}</strong>
            </div>
          ) : null}

          {params.error ? (
            <div className="empty-state empty-state--compact">
              <strong>작업을 완료하지 못했습니다.</strong>
              <p>{params.error}</p>
            </div>
          ) : null}

          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">CATALOG</p>
                <h2>
                  전체 게임 ({games.length}개) · 노출 {activeCount} / 숨김 {inactiveCount}
                </h2>
              </div>
              <span className="muted">노출 해제 시 거래소 허브와 게시판에서 즉시 제외됩니다.</span>
            </div>

            <div className="admin-list">
              {games.map((game) => {
                const iconUrl = getGameIconUrl(game.iconPath);
                const genreLabel = game.genre ? GENRE_LABELS[game.genre] : "미분류";
                return (
                  <article
                    className={`admin-list__row${!game.isActive ? " admin-list__row--inactive" : ""}`}
                    key={`game-${game.id}`}
                  >
                    <div className="admin-list__main">
                      <strong className="staff-game-row__title">
                        {iconUrl ? (
                          <img
                            alt=""
                            aria-hidden="true"
                            className="staff-game-row__icon"
                            src={iconUrl}
                          />
                        ) : null}
                        <span>{game.name}</span>
                      </strong>
                      <div className="market-table__meta">
                        slug: <code>{game.slug}</code> · {genreLabel} · 정렬 #{game.sortOrder}
                      </div>
                    </div>
                    <div className="seller-stats">
                      <span>전체 {game.postCount}</span>
                      <span>거래중 {game.openPostCount}</span>
                      <span className={game.isActive ? "muted-active" : "muted-inactive"}>
                        {game.isActive ? "노출중" : "숨김"}
                      </span>
                    </div>
                    <div className="admin-actions">
                      {game.isActive ? (
                        <form action={toggleGameActiveAction.bind(null, game.id, false)}>
                          <button className="button button--light" type="submit">
                            숨김 처리
                          </button>
                        </form>
                      ) : (
                        <form action={toggleGameActiveAction.bind(null, game.id, true)}>
                          <button className="button button--dark" type="submit">
                            노출 처리
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
