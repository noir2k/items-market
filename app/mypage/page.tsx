import Link from "next/link";
import { redirect } from "next/navigation";
import { LoadMoreButton } from "../../components/LoadMoreButton";
import { MarketTable } from "../../components/MarketTable";
import { signOutAction } from "../auth/actions";
import { listPostsByAuthorLimited } from "../../lib/market-server";
import { getMemberStatusLabel, getRoleLabel } from "../../lib/auth-utils";
import { createClient, getCurrentProfile } from "../../lib/supabase/server";
import { getTrustSignal } from "../../lib/trust-server";
import { getActivityLabel, getMembershipLabel, getSuccessRate, getTrustBadge } from "../../lib/trust-utils";
import { TrustBadge } from "../../components/TrustBadge";

export const metadata = {
  title: "마이페이지 | ITEM ODIN"
};

const INITIAL_SHOW = 20;
const SHOW_INCREMENT = 20;
const SHOW_HARD_CAP = 600;

function parseShow(raw: string | undefined): number {
  const n = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(n) || n <= 0) return INITIAL_SHOW;
  return Math.min(SHOW_HARD_CAP, n);
}

export default async function MyPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; show?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { profile, user } = await getCurrentProfile();

  if (!user || !profile) {
    redirect("/login?error=" + encodeURIComponent("로그인 후 마이페이지를 이용해 주세요."));
  }

  const show = parseShow(resolvedSearchParams.show);
  const supabase = await createClient();
  const [{ posts, totalCount }, trustSignal, summaryRow] = await Promise.all([
    listPostsByAuthorLimited(user.id, show),
    getTrustSignal(user.id),
    // 전체 통계는 view에서 한 번에 — 페이지의 visible posts와 무관
    supabase
      .from("profile_post_summary")
      .select("post_count, open_post_count, closed_post_count")
      .eq("profile_id", user.id)
      .maybeSingle()
  ]);
  const summary = {
    buyCount: posts.filter((p) => p.tradeType === "buy").length, // 페이지 기준 — 보통 의미 작음
    closedCount: summaryRow.data?.closed_post_count ?? 0,
    commentCount: trustSignal?.commentCount ?? 0,
    openCount: summaryRow.data?.open_post_count ?? 0,
    sellCount: posts.filter((p) => p.tradeType === "sell").length,
    totalCount: summaryRow.data?.post_count ?? totalCount
  };
  const hasMore = posts.length < totalCount;
  const nextShow = Math.min(SHOW_HARD_CAP, show + SHOW_INCREMENT);
  const loadMoreHref = hasMore ? `/mypage?show=${nextShow}` : null;
  const loadMoreIncrement = Math.min(SHOW_INCREMENT, totalCount - posts.length);
  const trustBadge = trustSignal
    ? getTrustBadge({
        joinedAtIso: trustSignal.joinedAtIso,
        role: profile.role,
        totalPosts: trustSignal.totalPosts
      })
    : null;
  const trustSuccessRate = trustSignal
    ? getSuccessRate(trustSignal.totalPosts, trustSignal.closedPosts)
    : 0;

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>회원별 내가 쓴 거래 글 목록과 상태를 확인할 수 있습니다</span>
          <Link href="/market">거래소 보기</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">MY PAGE</p>
          <h1>마이페이지</h1>
          <p>내 프로필과 내가 등록한 삽니다 / 팝니다 게시글 현황을 한 화면에서 확인합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <article className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">PROFILE</p>
                <h2>{profile.nickname}</h2>
              </div>
            </div>

            {resolvedSearchParams.message ? (
              <div className="empty-state empty-state--compact">
                <strong>{resolvedSearchParams.message}</strong>
              </div>
            ) : null}

            {resolvedSearchParams.error ? (
              <div className="empty-state empty-state--compact">
                <strong>작업을 완료하지 못했습니다.</strong>
                <p>{resolvedSearchParams.error}</p>
              </div>
            ) : null}

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

            {trustSignal && trustBadge ? (
              <div className="trust-card">
                <div className="trust-card__row">
                  <span className="trust-card__label">신뢰 등급</span>
                  <TrustBadge kind={trustBadge.kind} label={trustBadge.label} />
                </div>
                <div className="trust-card__row">
                  <span className="trust-card__label">총 거래</span>
                  <span className="trust-card__value">
                    {trustSignal.totalPosts}회 · 완료 {trustSignal.closedPosts}회
                    {trustSignal.totalPosts > 0 ? ` (${trustSuccessRate}%)` : ""}
                  </span>
                </div>
                <div className="trust-card__row">
                  <span className="trust-card__label">댓글 활동</span>
                  <span className="trust-card__value">{trustSignal.commentCount}건</span>
                </div>
                <div className="trust-card__row">
                  <span className="trust-card__label">최근 활동</span>
                  <span className="trust-card__value">
                    {getActivityLabel(trustSignal.recentPosts30d, trustSignal.recentComments30d)}
                  </span>
                </div>
                <div className="trust-card__row">
                  <span className="trust-card__label">가입</span>
                  <span className="trust-card__value">{getMembershipLabel(trustSignal.joinedAtIso)}</span>
                </div>
              </div>
            ) : null}

            <div className="summary-grid">
              <article className="summary-card">
                <span>전체 게시글</span>
                <strong>{summary.totalCount}</strong>
              </article>
              <article className="summary-card">
                <span>거래중</span>
                <strong>{summary.openCount}</strong>
              </article>
              <article className="summary-card">
                <span>거래완료</span>
                <strong>{summary.closedCount}</strong>
              </article>
              <article className="summary-card">
                <span>댓글</span>
                <strong>{summary.commentCount}</strong>
              </article>
              <article className="summary-card">
                <span>팝니다/삽니다</span>
                <strong>
                  {summary.sellCount}/{summary.buyCount}
                </strong>
              </article>
            </div>

            <div className="chip-row">
              <Link className="button button--dark" href="/sell">
                판매 글 등록
              </Link>
              <Link className="button button--light" href="/buy">
                구매 글 등록
              </Link>
            </div>

            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">MY POSTS</p>
                <h3>내가 등록한 거래 글</h3>
              </div>
            </div>

            {posts.length > 0 ? (
              <>
                <MarketTable items={posts} />
                {loadMoreHref ? (
                  <LoadMoreButton
                    fetchedCount={posts.length}
                    href={loadMoreHref}
                    increment={loadMoreIncrement}
                    totalCount={totalCount}
                  />
                ) : null}
              </>
            ) : (
              <div className="empty-state">
                <strong>아직 등록한 거래 글이 없습니다.</strong>
                <p>판매등록 또는 구매등록 화면에서 첫 게시글을 등록해 주세요.</p>
              </div>
            )}

            <form action={signOutAction}>
              <button className="button button--light" type="submit">
                로그아웃
              </button>
            </form>
          </article>

          <aside className="panel side-info">
            <p className="eyebrow">ACTION</p>
            <h3>내 글에서 바로 할 수 있는 작업</h3>
            <ul className="bullet-list">
              <li>상세 페이지에서 게시글 수정 / 삭제</li>
              <li>거래가 끝난 글은 거래완료 상태로 전환</li>
              <li>댓글 수와 최근 갱신 시간 기준으로 내 거래 현황 확인</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
