import Link from "next/link";
import { createMarketPostAction } from "../market/actions";
import { MarketPostForm } from "../../components/MarketPostForm";
import { listMarketGameOptions } from "../../lib/market-server";
import { getCurrentProfile } from "../../lib/supabase/server";

export const metadata = {
  title: "구매등록 | ITEMMARKET"
};

export default async function BuyPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [games, { user }] = await Promise.all([listMarketGameOptions(), getCurrentProfile()]);

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>희망 조건을 등록하고 삽니다 거래 글로 판매 제안을 받아보세요</span>
          <Link href="/guide">거래 절차 확인</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">BUY ORDER</p>
          <h1>구매등록</h1>
          <p>희망 가격과 거래 조건을 입력해 판매자의 제안을 받아보세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container form-layout">
          {user ? (
            <MarketPostForm
              action={createMarketPostAction}
              buttonLabel="구매 요청 등록하기"
              error={resolvedSearchParams.error}
              games={games}
              message={resolvedSearchParams.message}
              title="구매 조건 입력"
              tradeType="buy"
            />
          ) : (
            <article className="panel form-panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">LOGIN REQUIRED</p>
                  <h2>로그인 후 구매 요청을 등록할 수 있습니다</h2>
                </div>
              </div>
              <p className="muted">회원 로그인 후 희망 게임, 서버, 수량, 금액 조건을 입력해 판매 제안을 받을 수 있습니다.</p>
              <div className="chip-row">
                <Link className="button button--dark" href={`/login?next=${encodeURIComponent("/buy")}`}>
                  로그인
                </Link>
                <Link className="button button--light" href="/signup">
                  회원가입
                </Link>
              </div>
            </article>
          )}

          <aside className="panel side-info">
            <p className="eyebrow">BUYER CHECK</p>
            <h3>구매 요청 등록 안내</h3>
            <ul className="bullet-list">
              <li>희망 게임, 서버, 금액, 거래 조건을 정확히 입력해 주세요.</li>
              <li>판매자는 상세 글의 댓글을 통해 제안을 남길 수 있습니다.</li>
              <li>거래 성사 후 글쓴이 또는 관리자가 거래완료 처리할 수 있습니다.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
