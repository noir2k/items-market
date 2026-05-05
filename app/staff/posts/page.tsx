import Link from "next/link";
import { redirect } from "next/navigation";
import { adminCloseMarketPostAction, adminDeleteMarketPostAction } from "../actions";
import { getAdminDashboardData } from "../../../lib/admin-server";
import { isAdminProfile } from "../../../lib/auth-utils";
import { getStatusLabel, getTradeTypeLabel } from "../../../lib/market-utils";
import { getCurrentProfile } from "../../../lib/supabase/server";

export const metadata = {
  title: "게시물 관리 | ITEM ODIN STAFF"
};

export default async function StaffPostsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; status?: string }>;
}) {
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile || !isAdminProfile(profile)) {
    redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
  }

  const params = await searchParams;
  const dashboard = await getAdminDashboardData({});
  const filterStatus = params.status === "open" || params.status === "closed" ? params.status : "all";
  const visiblePosts = dashboard.posts.filter((post) => filterStatus === "all" || post.status === filterStatus);

  return (
    <main>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">STAFF · POSTS</p>
          <h1>게시물 관리</h1>
          <p>최신순 전체 거래 글을 관리합니다. 거래완료 처리와 삭제는 즉시 적용됩니다.</p>
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
                <h2>전체 게시글 ({visiblePosts.length}건)</h2>
              </div>
              <nav className="staff-status-filter" aria-label="상태 필터">
                <Link className={filterStatus === "all" ? "is-active" : undefined} href="/staff/posts">
                  전체
                </Link>
                <Link
                  className={filterStatus === "open" ? "is-active" : undefined}
                  href="/staff/posts?status=open"
                >
                  거래중
                </Link>
                <Link
                  className={filterStatus === "closed" ? "is-active" : undefined}
                  href="/staff/posts?status=closed"
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
