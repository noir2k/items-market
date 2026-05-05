import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createGameAction,
  deleteGameAction,
  toggleGameActiveAction,
  updateGameAction
} from "../actions";
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

const GENRE_OPTIONS: GameGenre[] = [
  "mmorpg_pc",
  "mmorpg_mobile",
  "rpg_mobile",
  "action",
  "sports",
  "fps",
  "moba",
  "casual",
  "other"
];

export default async function StaffGamesPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string; error?: string; message?: string }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const games = await listAdminGames();
  const activeCount = games.filter((g) => g.isActive).length;
  const inactiveCount = games.length - activeCount;
  const editingGameId = params.edit ? Number.parseInt(params.edit, 10) : null;
  const editingGame = editingGameId ? games.find((g) => g.id === editingGameId) ?? null : null;

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · BOARDS</p>
          <h1>게시판 관리</h1>
          <p>
            게임 카탈로그를 관리합니다. 신규 게시판 추가, 정보 수정, 노출/숨김 토글, 삭제까지 한 화면에서 처리합니다.
          </p>
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

          {/* ── 신규 게시판 추가 폼 ── */}
          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">CREATE</p>
                <h2>신규 게시판 추가</h2>
              </div>
              <span className="muted">slug는 영소문자/숫자/하이픈만 사용. 추가 후 아이콘은 별도 업로드.</span>
            </div>

            <form action={createGameAction} className="staff-game-form">
              <label className="field">
                <span>slug</span>
                <input
                  name="slug"
                  pattern="[a-z0-9-]+"
                  placeholder="예: tos"
                  required
                  type="text"
                />
              </label>
              <label className="field">
                <span>이름</span>
                <input name="name" placeholder="예: 트리 오브 세이비어" required type="text" />
              </label>
              <label className="field">
                <span>장르</span>
                <select defaultValue="mmorpg_pc" name="genre" required>
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {GENRE_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>정렬 순서</span>
                <input
                  defaultValue={Math.max(...games.map((g) => g.sortOrder), 0) + 10}
                  min={0}
                  name="sort_order"
                  required
                  type="number"
                />
              </label>
              <label className="field staff-game-form__icon">
                <span>아이콘 파일명 (선택)</span>
                <input name="icon_path" placeholder="예: tos.png (Storage 업로드 후)" type="text" />
              </label>
              <div className="staff-game-form__submit">
                <button className="button button--dark" type="submit">
                  게시판 추가
                </button>
              </div>
            </form>
          </section>

          {/* ── 편집 모드 패널 (URL ?edit=<id> 시 노출) ── */}
          {editingGame ? (
            <section className="panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">EDIT</p>
                  <h2>{editingGame.name} 수정</h2>
                </div>
                <Link className="text-link" href="/staff/games">
                  편집 취소 ×
                </Link>
              </div>

              <form action={updateGameAction.bind(null, editingGame.id)} className="staff-game-form">
                <label className="field">
                  <span>slug (변경 불가)</span>
                  <input defaultValue={editingGame.slug} disabled type="text" />
                </label>
                <label className="field">
                  <span>이름</span>
                  <input defaultValue={editingGame.name} name="name" required type="text" />
                </label>
                <label className="field">
                  <span>장르</span>
                  <select defaultValue={editingGame.genre || "other"} name="genre" required>
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {GENRE_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>정렬 순서</span>
                  <input defaultValue={editingGame.sortOrder} min={0} name="sort_order" required type="number" />
                </label>
                <label className="field staff-game-form__icon">
                  <span>아이콘 파일명</span>
                  <input
                    defaultValue={editingGame.iconPath || ""}
                    name="icon_path"
                    placeholder="비우면 placeholder 사용"
                    type="text"
                  />
                </label>
                <div className="staff-game-form__submit">
                  <button className="button button--dark" type="submit">
                    수정 저장
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {/* ── 카탈로그 목록 ── */}
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
                        ) : (
                          <span aria-hidden="true" className="staff-game-row__icon staff-game-row__icon--placeholder">
                            {game.name.charAt(0)}
                          </span>
                        )}
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
                      <Link className="button button--light" href={`/staff/games?edit=${game.id}`}>
                        수정
                      </Link>
                      {game.isActive ? (
                        <form action={toggleGameActiveAction.bind(null, game.id, false)}>
                          <button className="button button--light" type="submit">
                            숨김
                          </button>
                        </form>
                      ) : (
                        <form action={toggleGameActiveAction.bind(null, game.id, true)}>
                          <button className="button button--dark" type="submit">
                            노출
                          </button>
                        </form>
                      )}
                      <form action={deleteGameAction.bind(null, game.id)}>
                        <label className="checkbox-row">
                          <span>
                            <input name="confirmDelete" type="checkbox" /> 삭제 확인
                          </span>
                        </label>
                        <button
                          className="button button--light"
                          disabled={game.postCount > 0}
                          title={game.postCount > 0 ? "게시글이 있어 삭제 불가" : ""}
                          type="submit"
                        >
                          삭제
                        </button>
                      </form>
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
