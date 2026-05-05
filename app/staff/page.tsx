import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminProfile } from "../../lib/auth-utils";
import { getAdminDashboardData } from "../../lib/admin-server";
import { getCurrentProfile } from "../../lib/supabase/server";
import { getStatusLabel, getTradeTypeLabel } from "../../lib/market-utils";

export const metadata = {
  title: "관리자 대시보드 | ITEM ODIN"
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value.toLocaleString("ko-KR")}</strong>
    </article>
  );
}

export default async function StaffDashboardPage() {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const dashboard = await getAdminDashboardData({});
  const recentMembers = dashboard.members.slice(0, 5);
  const recentPosts = dashboard.posts.slice(0, 5);

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · DASHBOARD</p>
          <h1>운영 현황 한눈에</h1>
          <p>전체 회원/게시글 현황과 최근 활동을 요약합니다. 상세 작업은 상단 메뉴에서 진행하세요.</p>
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
        <div className="container staff-dashboard__grid">
          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">MEMBERS</p>
                <h2>최근 가입 회원</h2>
              </div>
              <Link className="text-link" href="/staff/members">
                전체 회원 →
              </Link>
            </div>

            <div className="admin-list">
              {recentMembers.length === 0 ? (
                <div className="empty-state empty-state--compact">
                  <strong>가입 회원이 없습니다.</strong>
                </div>
              ) : (
                recentMembers.map((member) => (
                  <article className="admin-list__row" key={`recent-member-${member.id}`}>
                    <div className="admin-list__main">
                      <strong>{member.nickname}</strong>
                      <div className="market-table__meta">{member.email}</div>
                    </div>
                    <div className="seller-stats">
                      <span>전체 {member.postCount}</span>
                      <span>거래중 {member.openPostCount}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">POSTS</p>
                <h2>최근 게시글</h2>
              </div>
              <Link className="text-link" href="/staff/posts">
                전체 게시글 →
              </Link>
            </div>

            <div className="admin-list">
              {recentPosts.length === 0 ? (
                <div className="empty-state empty-state--compact">
                  <strong>게시글이 없습니다.</strong>
                </div>
              ) : (
                recentPosts.map((post) => (
                  <article className="admin-list__row" key={`recent-post-${post.id}`}>
                    <div className="admin-list__main">
                      <strong>
                        <Link href={`/market/${post.id}`}>{post.title}</Link>
                      </strong>
                      <div className="market-table__meta">
                        {post.game} · {post.authorName}
                      </div>
                    </div>
                    <div className="seller-stats">
                      <span>{getTradeTypeLabel(post.tradeType)}</span>
                      <span>{getStatusLabel(post.status)}</span>
                      <span>{post.price}</span>
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
