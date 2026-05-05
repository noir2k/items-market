import Link from "next/link";
import { redirect } from "next/navigation";
import { TrustBadge } from "../../../components/TrustBadge";
import { signOutAction } from "../../auth/actions";
import { updateMemberStatusAction } from "../actions";
import { formatMonthOption } from "../../../lib/admin-utils";
import { getAdminDashboardData } from "../../../lib/admin-server";
import { getMemberStatusLabel, getRoleLabel, isAdminProfile } from "../../../lib/auth-utils";
import { getStatusLabel, getTradeTypeLabel } from "../../../lib/market-utils";
import { getCurrentProfile } from "../../../lib/supabase/server";
import { getTrustSignalsByIds } from "../../../lib/trust-server";
import { getTrustBadge } from "../../../lib/trust-utils";

export const metadata = {
  title: "회원 관리 | ITEM ODIN STAFF"
};

export default async function StaffMembersPage({
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

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const dashboard = await getAdminDashboardData({
    memberId: params.memberId || null,
    month: params.month || null
  });
  const trustSignalsByMemberId = await getTrustSignalsByIds(dashboard.members.map((member) => member.id));

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

          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">LIST</p>
                <h2>회원 목록 ({dashboard.members.length}명)</h2>
              </div>
              <span className="muted">회원 선택 시 월별 게시글 조회와 export가 활성화됩니다.</span>
            </div>

            <div className="admin-list">
              {dashboard.members.map((member) => {
                const trust = trustSignalsByMemberId[member.id];
                const trustBadge = trust && member.role
                  ? getTrustBadge({
                      joinedAtIso: trust.joinedAtIso,
                      role: member.role,
                      totalPosts: trust.totalPosts
                    })
                  : null;
                return (
                  <article
                    className={`admin-list__row${params.memberId === member.id ? " admin-list__row--active" : ""}`}
                    key={member.id}
                  >
                    <div className="admin-list__main">
                      <strong>
                        <Link href={`/staff/members?memberId=${encodeURIComponent(member.id)}`}>
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
                );
              })}
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
                      {getRoleLabel(dashboard.selectedMember.role)} ·{" "}
                      {getMemberStatusLabel(dashboard.selectedMember.status)}
                    </p>
                  </div>
                </div>

                <form action="/staff/members" className="board-toolbar board-toolbar--admin">
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
                      href={`/staff/export?memberId=${encodeURIComponent(dashboard.selectedMember.id)}${params.month ? `&month=${encodeURIComponent(params.month)}` : ""}`}
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
      </section>
    </main>
  );
}
