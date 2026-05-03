import Link from "next/link";
import { notFound } from "next/navigation";
import {
  closeMarketPostAction,
  createMarketCommentAction,
  deleteMarketPostAction
} from "../actions";
import { isAdminProfile } from "../../../lib/auth-utils";
import { getMarketPostById } from "../../../lib/market-server";
import { canManageMarketPost, getStatusLabel, getTradeTypeLabel } from "../../../lib/market-utils";
import { getCurrentProfile } from "../../../lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMarketPostById(id);

  if (!item) {
    return {
      title: "거래 상세 | ITEMMARKET"
    };
  }

  return {
    description: `${item.game} ${item.server} 거래 상세 페이지`,
    title: `${item.title} | ITEMMARKET`
  };
}

export default async function ListingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const item = await getMarketPostById(id);
  const { profile, user } = await getCurrentProfile();

  if (!item) {
    notFound();
  }

  const canManage = canManageMarketPost({
    authorId: item.authorId || "",
    isAdmin: isAdminProfile(profile),
    viewerId: user?.id
  });
  const commentAction = createMarketCommentAction.bind(null, item.id);
  const closeAction = closeMarketPostAction.bind(null, item.id);
  const deleteAction = deleteMarketPostAction.bind(null, item.id);

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래 상세, 댓글 문의, 거래완료 처리 흐름을 확인하세요</span>
          <Link href="/market">목록으로 돌아가기</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">ITEM DETAIL</p>
          <h1>거래 상세</h1>
          <p>거래 글 정보와 댓글 문의 현황을 확인하고, 글쓴이 또는 관리자가 거래완료 처리할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <section className="detail-summary">
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

            <div className="detail-box">
              <div className="listing-badges">
                {(item.badges || []).map((badge, index) => (
                  <span className={index === 0 ? "badge" : "badge badge--neutral"} key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
              <h2>{item.title}</h2>
              <div className="detail-summary__meta">
                <span className="chip">{item.game}</span>
                <span className="chip">{item.server}</span>
                <span className="chip">{item.category}</span>
                <span className={`chip chip--${item.tradeType}`}>
                  {getTradeTypeLabel(item.tradeType)}
                </span>
                <span className={`chip chip--status-${item.status}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <p className="muted">{item.summary}</p>
            </div>

            <div className="detail-box">
              <h3>상품 정보</h3>
              <div className="detail-meta-list">
                <span>거래 게임</span>
                <strong>{item.game}</strong>
              </div>
              <div className="detail-meta-list">
                <span>서버 / 월드</span>
                <strong>{item.server}</strong>
              </div>
              <div className="detail-meta-list">
                <span>수량 / 조건</span>
                <strong>{item.quantity}</strong>
              </div>
              <div className="detail-meta-list">
                <span>작성자</span>
                <strong>
                  {item.authorName} · {item.authorRoleLabel}
                </strong>
              </div>
              <div className="detail-meta-list">
                <span>최근 갱신</span>
                <strong>{item.updatedAt}</strong>
              </div>
            </div>

            <div className="detail-box">
              <h3>거래 설명</h3>
              <p className="muted">{item.content}</p>
            </div>

            <div className="detail-box">
              <h3>안전거래 안내</h3>
              <ul className="bullet-list">
                <li>구매 전 서버명, 캐릭터명, 수량을 반드시 재확인합니다.</li>
                <li>댓글 또는 문의 내용에 실제 연락처를 남기기 전 거래 조건을 먼저 확인해 주세요.</li>
                <li>거래가 끝난 뒤에는 완료 상태와 정산 내역을 다시 확인해 주세요.</li>
              </ul>
            </div>

            <div className="detail-box">
              <h3>거래 댓글</h3>
              <div className="comment-list">
                {item.comments.length > 0 ? (
                  item.comments.map((comment) => (
                    <article className="comment-card" key={comment.id}>
                      <div className="comment-card__top">
                        <strong>{comment.author}</strong>
                        <span className="chip chip--muted">{comment.label}</span>
                      </div>
                      <p>{comment.message}</p>
                      <span className="muted">{comment.createdAt}</span>
                    </article>
                  ))
                ) : (
                  <div className="empty-state empty-state--compact">
                    <strong>아직 등록된 댓글이 없습니다.</strong>
                    <p>첫 거래 문의를 남겨 판매자 또는 구매자와 연결할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-box">
              <h3>댓글 남기기</h3>
              {user ? (
                item.status === "open" ? (
                  <form action={commentAction} className="form-panel">
                    <label className="field">
                      <span>{item.tradeType === "sell" ? "구매 문의" : "판매 제안"}</span>
                      <textarea
                        name="content"
                        placeholder={item.tradeType === "sell" ? "예: 60억만 먼저 거래 가능한지 문의드립니다." : "예: 동일 조건으로 판매 가능합니다."}
                        rows={5}
                      />
                    </label>
                    <button className="button button--dark" type="submit">
                      댓글 등록
                    </button>
                  </form>
                ) : (
                  <div className="empty-state empty-state--compact">
                    <strong>거래완료된 게시글입니다.</strong>
                    <p>추가 댓글 등록은 제한됩니다.</p>
                  </div>
                )
              ) : (
                <div className="empty-state empty-state--compact">
                  <strong>댓글 등록은 로그인 후 가능합니다.</strong>
                  <p>
                    <Link href={`/login?next=${encodeURIComponent(`/market/${item.id}`)}`}>로그인 페이지로 이동</Link>
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="seller-card">
            <div>
              <p className="eyebrow">PRICE</p>
              <h3>거래 금액</h3>
            </div>
            <div className="detail-pricing__row">
              <span>등록가</span>
              <strong>{item.price}</strong>
            </div>
            <div className="detail-pricing__row">
              <span>작성자</span>
              <span>{item.authorName}</span>
            </div>
            <div className="detail-pricing__row">
              <span>회원 유형</span>
              <span>{item.authorRoleLabel}</span>
            </div>
            <div className="seller-stats">
              <span>{getStatusLabel(item.status)}</span>
              <span>댓글 {item.commentCount}</span>
              <span>조회 {item.views}</span>
            </div>
            <Link className="button button--dark button--full" href={item.tradeType === "buy" ? "/sell" : "/buy"}>
              {item.tradeType === "buy" ? "판매 글 등록하기" : "구매 글 등록하기"}
            </Link>
            {canManage ? (
              <>
                <Link className="button button--light button--full" href={`/market/${item.id}/edit`}>
                  게시글 수정
                </Link>
                {item.status === "open" ? (
                  <form action={closeAction}>
                    <button className="button button--light button--full" type="submit">
                      거래완료 처리
                    </button>
                  </form>
                ) : null}
                <form action={deleteAction}>
                  <label className="checkbox-row">
                    <span>
                      <input name="confirmDelete" type="checkbox" /> 삭제 확인
                    </span>
                  </label>
                  <button className="button button--light button--full" type="submit">
                    게시글 삭제
                  </button>
                </form>
              </>
            ) : null}
            <Link className="button button--light button--full" href="/market">
              목록으로 돌아가기
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
