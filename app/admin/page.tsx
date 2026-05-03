import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "../auth/actions";
import {
  adminCloseMarketPostAction,
  adminDeleteMarketPostAction,
  updateMemberStatusAction
} from "./actions";
import { formatMonthOption } from "../../lib/admin-utils";
import { getAdminDashboardData } from "../../lib/admin-server";
import { getStatusLabel, getTradeTypeLabel } from "../../lib/market-utils";
import { getMemberStatusLabel, getRoleLabel, isAdminProfile } from "../../lib/auth-utils";
import { getCurrentProfile } from "../../lib/supabase/server";

export const metadata = {
  title: "관리자 | ITEMMARKET"
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string;
    memberId?: string;
    message?: string;
    month?: string;
  }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !isAdminProfile(profile)) {
    redirect("/admin/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const dashboard = await getAdminDashboardData({
    memberId: params.memberId || null,
    month: params.month || null
  });

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>회원 목록, 전체 게시글 관리, 월별 회원 게시글 export를 한 화면에서 관리합니다.</span>
          <Link href="/market">거래소로 이동</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">ADMIN</p>
          <h1>관리자 대시보드</h1>
          <p>게시글 삭제/거래완료, 회원 상태 관리, 회원별 월단위 게시글 조회와 export를 수행합니다.</p>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="summary-grid">
            <SummaryCard label="전체 회원" value={dashboard.summary.totalMembers} />
            <SummaryCard label="활성 회원" value={dashboard.summary.activeMembers} />
            <SummaryCard label="정지 회원" value={dashboard.summary.suspendedMembers} />
            <SummaryCard label="전체 게시글" value={dashboard.summary.totalPosts} />
            <SummaryCard label="거래중 게시글" value={dashboard.summary.openPosts} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container admin-layout">
          <aside className="panel admin-sidebar">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">PROFILE</p>
                <h2>{profile.nickname}</h2>
              </div>
            </div>

            <div className="notice-list">
              <div>
                <strong>이메일</strong>
                <p>{profile.email}</p>
              </div>
              <div>
                <strong>권한</strong>
                <p>{getRoleLabel(profile.role)}</p>
              </div>
              <div>
                <strong>상태</strong>
                <p>{getMemberStatusLabel(profile.status)}</p>
              </div>
            </div>

            <form action={signOutAction}>
              <button className="button button--dark button--full" type="submit">
                로그아웃
              </button>
            </form>

            <div className="board-note">
              <strong>운영 기준</strong>
              <ul className="bullet-list">
                <li>게시글 삭제와 거래완료 처리는 관리자 권한으로 즉시 적용됩니다.</li>
                <li>회원 상태는 활성/정지로 관리하며, 관리자 자기 자신은 정지할 수 없습니다.</li>
                <li>회원별 월단위 게시글은 CSV로 export됩니다.</li>
              </ul>
            </div>
          </aside>

          <div className="admin-content">
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
                  <p className="eyebrow">MEMBERS</p>
                  <h2>회원 목록</h2>
                </div>
                <span className="muted">회원 선택 시 월별 게시글 조회와 export가 활성화됩니다.</span>
              </div>

              <div className="admin-list">
                {dashboard.members.map((member) => (
                  <article className={`admin-list__row${params.memberId === member.id ? " admin-list__row--active" : ""}`} key={member.id}>
                    <div className="admin-list__main">
                      <strong>
                        <Link href={`/admin?memberId=${encodeURIComponent(member.id)}`}>{member.nickname}</Link>
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
                      ) : member.status === "active" ? (
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
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">POSTS</p>
                  <h2>전체 게시글 관리</h2>
                </div>
                <span className="muted">최신 순으로 전체 거래 글을 관리합니다.</span>
              </div>

              <div className="admin-list">
                {dashboard.posts.map((post) => (
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
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">MEMBER POSTS</p>
                  <h2>회원별 게시글 조회 / Export</h2>
                </div>
              </div>

              {dashboard.selectedMember ? (
                <>
                  <div className="notice-list">
                    <div>
                      <strong>선택 회원</strong>
                      <p>
                        {dashboard.selectedMember.nickname} · {dashboard.selectedMember.email}
                      </p>
                    </div>
                    <div>
                      <strong>회원 상태</strong>
                      <p>
                        {getRoleLabel(dashboard.selectedMember.role)} · {getMemberStatusLabel(dashboard.selectedMember.status)}
                      </p>
                    </div>
                  </div>

                  <form action="/admin" className="board-toolbar">
                    <input name="memberId" type="hidden" value={dashboard.selectedMember.id} />
                    <label className="field">
                      <span>조회 월</span>
                      <select defaultValue={params.month || ""} name="month">
                        <option value="">전체 기간</option>
                        {dashboard.monthOptions.map((month) => (
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
                        href={`/admin/export?memberId=${encodeURIComponent(dashboard.selectedMember.id)}${params.month ? `&month=${encodeURIComponent(params.month)}` : ""}`}
                      >
                        CSV Export
                      </Link>
                    </div>
                  </form>

                  {dashboard.selectedMemberPosts.length > 0 ? (
                    <div className="admin-list">
                      {dashboard.selectedMemberPosts.map((post) => (
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
                    <div className="empty-state">
                      <strong>선택한 조건에 맞는 게시글이 없습니다.</strong>
                      <p>다른 월을 선택하거나 회원을 다시 선택해 주세요.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <strong>회원 목록에서 대상을 선택해 주세요.</strong>
                  <p>선택 후 월별 게시글 조회와 CSV export가 활성화됩니다.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
