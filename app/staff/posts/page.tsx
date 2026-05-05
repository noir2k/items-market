import Link from "next/link";
import { redirect } from "next/navigation";
import { adminCloseMarketPostAction, adminDeleteMarketPostAction } from "../actions";
import {
  filterAdminPosts,
  getAdminDashboardData,
  listAdminGames,
  type AdminGameRow
} from "../../../lib/admin-server";
import { isAdminProfile } from "../../../lib/auth-utils";
import { getStatusLabel, getTradeTypeLabel } from "../../../lib/market-utils";
import { getCurrentProfile } from "../../../lib/supabase/server";
import type { GameGenre } from "../../../lib/types";

export const metadata = {
  title: "게시물 관리 | ITEM ODIN STAFF"
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

export default async function StaffPostsPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    game?: string;
    genre?: string;
    message?: string;
    status?: string;
  }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const [dashboard, games] = await Promise.all([getAdminDashboardData({}), listAdminGames()]);

  const gamesBySlug: Record<string, AdminGameRow> = Object.fromEntries(
    games.map((game) => [game.slug, game])
  );

  const filterStatus =
    params.status === "open" || params.status === "closed" ? params.status : "all";
  const filterGameSlug = params.game && params.game !== "all" ? params.game : null;
  const filterGenre =
    params.genre && GENRE_OPTIONS.includes(params.genre as GameGenre)
      ? (params.genre as GameGenre)
      : null;

  const visiblePosts = filterAdminPosts(
    dashboard.posts,
    {
      gameSlug: filterGameSlug,
      genre: filterGenre,
      status: filterStatus
    },
    gamesBySlug
  );

  const buildHref = (overrides: Record<string, string | null>) => {
    const next = new URLSearchParams();
    if (filterStatus !== "all") next.set("status", filterStatus);
    if (filterGameSlug) next.set("game", filterGameSlug);
    if (filterGenre) next.set("genre", filterGenre);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    const qs = next.toString();
    return qs ? `/staff/posts?${qs}` : "/staff/posts";
  };

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · POSTS</p>
          <h1>게시물 관리</h1>
          <p>게임/장르/상태별로 거래 글을 필터링하고 관리합니다. 거래완료 처리와 삭제는 즉시 적용됩니다.</p>
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

          {/* ── 필터 폼 ── */}
          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">FILTER</p>
                <h2>필터</h2>
              </div>
              {(filterGameSlug || filterGenre || filterStatus !== "all") ? (
                <Link className="text-link" href="/staff/posts">
                  필터 초기화 ×
                </Link>
              ) : null}
            </div>

            <form action="/staff/posts" className="board-toolbar board-toolbar--admin" method="get">
              <label className="field">
                <span>게임</span>
                <select defaultValue={filterGameSlug || "all"} name="game">
                  <option value="all">전체 게임</option>
                  {games.map((game) => (
                    <option key={game.slug} value={game.slug}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>장르</span>
                <select defaultValue={filterGenre || "all"} name="genre">
                  <option value="all">전체 장르</option>
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {GENRE_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>상태</span>
                <select defaultValue={filterStatus} name="status">
                  <option value="all">전체</option>
                  <option value="open">거래중</option>
                  <option value="closed">거래완료</option>
                </select>
              </label>
              <div className="admin-filter-actions">
                <button className="button button--dark" type="submit">
                  필터 적용
                </button>
              </div>
            </form>
          </section>

          {/* ── 결과 목록 ── */}
          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">RESULTS</p>
                <h2>
                  {filterGameSlug ? gamesBySlug[filterGameSlug]?.name + " " : ""}
                  {filterGenre ? GENRE_LABELS[filterGenre] + " " : ""}
                  게시글 ({visiblePosts.length}건)
                </h2>
              </div>
              <nav className="staff-status-filter" aria-label="상태 빠른 필터">
                <Link className={filterStatus === "all" ? "is-active" : undefined} href={buildHref({ status: null })}>
                  전체
                </Link>
                <Link
                  className={filterStatus === "open" ? "is-active" : undefined}
                  href={buildHref({ status: "open" })}
                >
                  거래중
                </Link>
                <Link
                  className={filterStatus === "closed" ? "is-active" : undefined}
                  href={buildHref({ status: "closed" })}
                >
                  거래완료
                </Link>
              </nav>
            </div>

            <div className="admin-list">
              {visiblePosts.length === 0 ? (
                <div className="empty-state">
                  <strong>해당 조건의 게시글이 없습니다.</strong>
                </div>
              ) : (
                visiblePosts.map((post) => (
                  <article className="admin-list__row" key={post.id}>
                    <div className="admin-list__main">
                      <strong>
                        <Link href={`/market/${post.id}`}>{post.title}</Link>
                      </strong>
                      <div className="market-table__meta">
                        {post.game} · {post.server} · {post.category} · 작성자 {post.authorName}
                      </div>
                    </div>
                    <div className="seller-stats">
                      <span>{getTradeTypeLabel(post.tradeType)}</span>
                      <span>{getStatusLabel(post.status)}</span>
                      <span>댓글 {post.commentCount}</span>
                      <span>{post.price}</span>
                    </div>
                    <div className="admin-actions">
                      <Link className="button button--light" href={`/market/${post.id}/edit`}>
                        수정
                      </Link>
                      {post.status === "open" ? (
                        <form action={adminCloseMarketPostAction.bind(null, post.id)}>
                          <button className="button button--light" type="submit">
                            거래완료
                          </button>
                        </form>
                      ) : null}
                      <form action={adminDeleteMarketPostAction.bind(null, post.id)}>
                        <label className="checkbox-row">
                          <span>
                            <input name="confirmDelete" type="checkbox" /> 삭제 확인
                          </span>
                        </label>
                        <button className="button button--light" type="submit">
                          삭제
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
