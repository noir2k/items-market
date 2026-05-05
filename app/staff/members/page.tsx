import Link from "next/link";
import { Fragment } from "react";
import { redirect } from "next/navigation";
import { Pagination } from "../../../components/Pagination";
import { TrustBadge } from "../../../components/TrustBadge";
import { signOutAction } from "../../auth/actions";
import { impersonateMemberAction, updateMemberStatusAction } from "../actions";
import { formatMonthOption } from "../../../lib/admin-utils";
import {
  filterAdminMembers,
  getAdminDashboardData,
  listAdminGames,
  listMemberPostsRecent,
  type AdminMemberFilter
} from "../../../lib/admin-server";
import { getMemberStatusLabel, getRoleLabel, isAdminProfile } from "../../../lib/auth-utils";
import { getStatusLabel, getTradeTypeLabel } from "../../../lib/market-utils";
import { getCurrentProfile } from "../../../lib/supabase/server";
import { getTrustSignalsByIds } from "../../../lib/trust-server";
import { getTrustBadge } from "../../../lib/trust-utils";

export const metadata = {
  title: "회원 관리 | ITEM ODIN STAFF"
};

const PAGE_SIZE = 20;
const MEMBER_DETAIL_LIMIT = 20;

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw || "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function StaffMembersPage({
  searchParams
}: {
  searchParams: Promise<{
    activity?: string;
    error?: string;
    game?: string;
    memberId?: string;
    message?: string;
    month?: string;
    page?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  // 회원 목록은 메모리 페이지 슬라이스 (Phase 2에서 SQL로 이전 예정 — 1000명+ 시 필요).
  // 인라인 detail의 게시글은 SQL 단계에서 limit 20.
  const [dashboard, games] = await Promise.all([
    getAdminDashboardData({ memberId: null, month: null }),
    listAdminGames()
  ]);

  const filter: AdminMemberFilter = {
    activity:
      params.activity === "trading" || params.activity === "idle" ? params.activity : "all",
    gameSlug: params.game && params.game !== "all" ? params.game : null,
    search: params.search || "",
    status: params.status === "active" || params.status === "suspended" ? params.status : "all"
  };
  const filteredMembers = filterAdminMembers(dashboard.members, filter);
  const totalMembers = dashboard.members.length;
  const totalFiltered = filteredMembers.length;
  const page = parsePage(params.page);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageMembers = filteredMembers.slice(pageStart, pageStart + PAGE_SIZE);

  const trustSignalsByMemberId = await getTrustSignalsByIds(pageMembers.map((member) => member.id));
  const hasActiveFilter =
    Boolean(filter.search) ||
    filter.status !== "all" ||
    filter.activity !== "all" ||
    Boolean(filter.gameSlug);

  // 선택된 회원의 인라인 detail 데이터 — 페이지에 포함된 회원만 의미 있음
  const selectedMember = params.memberId
    ? dashboard.members.find((m) => m.id === params.memberId) ?? null
    : null;
  const isSelectedInPage = selectedMember
    ? pageMembers.some((m) => m.id === selectedMember.id)
    : false;
  const memberDetail = selectedMember && isSelectedInPage
    ? await listMemberPostsRecent({
        limit: MEMBER_DETAIL_LIMIT,
        memberId: selectedMember.id,
        month: params.month || null
      })
    : null;
  const monthOptions = memberDetail
    ? [
        ...new Set(
          memberDetail.posts
            .map((post) => post.createdAtIso?.slice(0, 7))
            .filter((m): m is string => Boolean(m))
        )
      ].sort().reverse()
    : [];

  /**
   * 필터+페이지 상태를 보존한 채 memberId만 토글하는 URL 빌더.
   * 현재 회원이 이미 선택된 상태에서 다시 클릭하면 detail 패널을 닫는다 (memberIdParam=null).
   */
  const buildMemberHref = (memberIdParam: string | null): string => {
    const next = new URLSearchParams();
    if (filter.search) next.set("search", filter.search);
    if (filter.status && filter.status !== "all") next.set("status", filter.status);
    if (filter.activity && filter.activity !== "all") next.set("activity", filter.activity);
    if (filter.gameSlug) next.set("game", filter.gameSlug);
    if (safePage !== 1) next.set("page", String(safePage));
    if (memberIdParam) next.set("memberId", memberIdParam);
    const qs = next.toString();
    const base = qs ? `/staff/members?${qs}` : "/staff/members";
    return memberIdParam ? `${base}#member-row-${memberIdParam}` : base;
  };

  /** 페이지 변경 시 memberId 컨텍스트는 해제 (다른 페이지에서 detail은 무의미) */
  const buildPageHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (filter.search) next.set("search", filter.search);
    if (filter.status && filter.status !== "all") next.set("status", filter.status);
    if (filter.activity && filter.activity !== "all") next.set("activity", filter.activity);
    if (filter.gameSlug) next.set("game", filter.gameSlug);
    if (nextPage !== 1) next.set("page", String(nextPage));
    const qs = next.toString();
    return qs ? `/staff/members?${qs}` : "/staff/members";
  };

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · MEMBERS</p>
          <h1>회원 관리</h1>
          <p>회원 목록을 조회하고 정지/해제 처리, 회원별 월간 게시글 CSV export를 진행합니다.</p>
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
                <h2>검색 / 필터</h2>
              </div>
              {hasActiveFilter ? (
                <Link className="text-link" href="/staff/members">
                  필터 초기화 ×
                </Link>
              ) : null}
            </div>

            <form action="/staff/members" className="board-toolbar board-toolbar--admin" method="get">
              <label className="field">
                <span>회원 검색</span>
                <input
                  defaultValue={filter.search || ""}
                  name="search"
                  placeholder="닉네임 또는 이메일"
                  type="search"
                />
              </label>
              <label className="field">
                <span>상태</span>
                <select defaultValue={filter.status || "all"} name="status">
                  <option value="all">전체 상태</option>
                  <option value="active">활성</option>
                  <option value="suspended">정지</option>
                </select>
              </label>
              <label className="field">
                <span>거래 활동</span>
                <select defaultValue={filter.activity || "all"} name="activity">
                  <option value="all">전체</option>
                  <option value="trading">거래중 (open ≥ 1)</option>
                  <option value="idle">비활성 (게시글 0)</option>
                </select>
              </label>
              <label className="field">
                <span>거래 게임</span>
                <select defaultValue={filter.gameSlug || "all"} name="game">
                  <option value="all">전체 게임</option>
                  {games.map((game) => (
                    <option key={game.slug} value={game.slug}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </label>
              {/* 필터 적용 시 선택된 회원 컨텍스트는 유지 (월별 export 흐름 보존) */}
              {params.memberId ? <input name="memberId" type="hidden" value={params.memberId} /> : null}
              {params.month ? <input name="month" type="hidden" value={params.month} /> : null}
              <div className="admin-filter-actions">
                <button className="button button--dark" type="submit">
                  필터 적용
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">LIST</p>
                <h2>
                  회원 목록 ({totalFiltered.toLocaleString("ko-KR")}명
                  {hasActiveFilter && totalFiltered !== totalMembers
                    ? ` / 전체 ${totalMembers.toLocaleString("ko-KR")}명`
                    : ""}
                  )
                </h2>
              </div>
              <span className="muted">회원 선택 시 월별 게시글 조회와 export가 활성화됩니다.</span>
            </div>

            {totalFiltered === 0 ? (
              <div className="empty-state">
                <strong>해당 조건의 회원이 없습니다.</strong>
                <p>다른 키워드/조건으로 다시 시도해 주세요.</p>
              </div>
            ) : null}

            {/* 상단 페이지네이션 */}
            {totalFiltered > 0 ? (
              <Pagination
                buildHref={buildPageHref}
                page={safePage}
                pageSize={PAGE_SIZE}
                totalCount={totalFiltered}
                unit="명"
              />
            ) : null}

            <div className="admin-list">
              {pageMembers.map((member) => {
                const trust = trustSignalsByMemberId[member.id];
                const trustBadge = trust && member.role
                  ? getTrustBadge({
                      joinedAtIso: trust.joinedAtIso,
                      role: member.role,
                      totalPosts: trust.totalPosts
                    })
                  : null;
                const isSelected = params.memberId === member.id;
                return (
                  <Fragment key={member.id}>
                    <article
                      className={`admin-list__row${isSelected ? " admin-list__row--active" : ""}`}
                      id={`member-row-${member.id}`}
                    >
                      <div className="admin-list__main">
                        <strong>
                          <Link
                            href={buildMemberHref(isSelected ? null : member.id)}
                            scroll={false}
                            title={isSelected ? "상세 닫기" : "월별 게시글 조회 / Export 열기"}
                          >
                            {member.nickname}
                          </Link>
                          {trustBadge ? <> <TrustBadge kind={trustBadge.kind} label={trustBadge.label} /></> : null}
                        </strong>
                        <div className="market-table__meta">
                          {member.email} · {getRoleLabel(member.role)} · 상태 {getMemberStatusLabel(member.status)}
                        </div>
                      </div>
                      <div className="seller-stats">
                        <span>전체 {member.postCount}</span>
                        <span>거래중 {member.openPostCount}</span>
                        <span>완료 {member.closedPostCount}</span>
                      </div>
                      <div className="admin-actions">
                        {member.id === user.id ? (
                          <span className="muted">본인 계정</span>
                        ) : (
                          <>
                            {member.role !== "admin" && member.status === "active" ? (
                              <form action={impersonateMemberAction.bind(null, member.id)}>
                                <button
                                  className="button button--light"
                                  title="이 계정으로 세션을 교체하여 일반 사용자 화면을 확인합니다. 관리자 복귀 가능."
                                  type="submit"
                                >
                                  가장 로그인
                                </button>
                              </form>
                            ) : null}
                            {member.status === "active" ? (
                              <form action={updateMemberStatusAction.bind(null, member.id, "suspended")}>
                                <button className="button button--light" type="submit">
                                  회원 정지
                                </button>
                              </form>
                            ) : (
                              <form action={updateMemberStatusAction.bind(null, member.id, "active")}>
                                <button className="button button--light" type="submit">
                                  정지 해제
                                </button>
                              </form>
                            )}
                          </>
                        )}
                      </div>
                    </article>

                    {/* ── 선택된 회원의 인라인 상세 (최근 N건 한정 + Export) ── */}
                    {isSelected && selectedMember && memberDetail ? (
                      <article className="admin-list__detail">
                        <header className="admin-list__detail-head">
                          <div>
                            <p className="eyebrow">MEMBER POSTS</p>
                            <h3>
                              {selectedMember.nickname}님의 최근 {MEMBER_DETAIL_LIMIT}건
                              {memberDetail.totalCount > MEMBER_DETAIL_LIMIT
                                ? ` (전체 ${memberDetail.totalCount.toLocaleString("ko-KR")}건)`
                                : ""}
                            </h3>
                          </div>
                          <Link className="text-link" href={buildMemberHref(null)} scroll={false}>
                            상세 닫기 ×
                          </Link>
                        </header>

                        <form action="/staff/members" className="board-toolbar board-toolbar--admin" method="get">
                          <input name="memberId" type="hidden" value={selectedMember.id} />
                          {filter.search ? <input name="search" type="hidden" value={filter.search} /> : null}
                          {filter.status && filter.status !== "all" ? (
                            <input name="status" type="hidden" value={filter.status} />
                          ) : null}
                          {filter.activity && filter.activity !== "all" ? (
                            <input name="activity" type="hidden" value={filter.activity} />
                          ) : null}
                          {filter.gameSlug ? <input name="game" type="hidden" value={filter.gameSlug} /> : null}
                          {safePage !== 1 ? <input name="page" type="hidden" value={String(safePage)} /> : null}
                          <label className="field">
                            <span>조회 월</span>
                            <select defaultValue={params.month || ""} name="month">
                              <option value="">전체 기간 (최근 {MEMBER_DETAIL_LIMIT}건)</option>
                              {monthOptions.map((month) => (
                                <option key={month} value={month}>
                                  {formatMonthOption(month)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="admin-filter-actions">
                            <button className="button button--dark" type="submit">
                              월 필터 적용
                            </button>
                            <Link
                              className="button button--light"
                              href={`/staff/posts?game=all&genre=all&status=all&authorPreview=${encodeURIComponent(
                                selectedMember.nickname || ""
                              )}`}
                              title="해당 회원의 게시글을 전체 보기 (관리 액션 가능)"
                            >
                              전체 게시글 보기 →
                            </Link>
                            <Link
                              className="button button--light"
                              href={`/staff/export?memberId=${encodeURIComponent(selectedMember.id)}${params.month ? `&month=${encodeURIComponent(params.month)}` : ""}`}
                            >
                              CSV Export
                            </Link>
                          </div>
                        </form>

                        {memberDetail.posts.length > 0 ? (
                          <div className="admin-list admin-list--nested">
                            {memberDetail.posts.map((post) => (
                              <article className="admin-list__row" key={`member-post-${post.id}`}>
                                <div className="admin-list__main">
                                  <strong>
                                    <Link href={`/market/${post.id}`}>{post.title}</Link>
                                  </strong>
                                  <div className="market-table__meta">
                                    {post.createdAt} · {post.game} · {post.server} · {post.quantity}
                                  </div>
                                </div>
                                <div className="seller-stats">
                                  <span>{getTradeTypeLabel(post.tradeType)}</span>
                                  <span>{getStatusLabel(post.status)}</span>
                                  <span>댓글 {post.commentCount}</span>
                                  <span>{post.price}</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state empty-state--compact">
                            <strong>선택한 조건에 맞는 게시글이 없습니다.</strong>
                            <p>다른 월을 선택하거나 다른 회원을 클릭해 주세요.</p>
                          </div>
                        )}
                      </article>
                    ) : null}
                  </Fragment>
                );
              })}
            </div>

            {/* 하단 페이지네이션 */}
            {totalFiltered > 0 ? (
              <Pagination
                buildHref={buildPageHref}
                page={safePage}
                pageSize={PAGE_SIZE}
                totalCount={totalFiltered}
                unit="명"
              />
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
