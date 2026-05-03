import Link from "next/link";
import { createMarketPostAction } from "../market/actions";
import { MarketPostForm } from "../../components/MarketPostForm";
import { listMarketGameOptions } from "../../lib/market-server";
import { getCurrentProfile } from "../../lib/supabase/server";

export const metadata = {
  title: "판매등록 | ITEMMARKET"
};

export default async function SellPage({
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
          <span>게임별 팝니다 글을 등록하고 거래 댓글을 받을 수 있습니다</span>
          <Link href="/market">등록 후 노출 위치 보기</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">SELL ORDER</p>
          <h1>판매등록</h1>
          <p>카테고리, 게임, 서버, 가격, 설명을 입력해 거래소에 판매 글을 등록하세요.</p>
        </div>
      </section>

      <section className="section">
        <div className="container form-layout">
          {user ? (
            <MarketPostForm
              action={createMarketPostAction}
              buttonLabel="판매 물품 등록하기"
              error={resolvedSearchParams.error}
              games={games}
              message={resolvedSearchParams.message}
              title="판매 정보 입력"
              tradeType="sell"
            />
          ) : (
            <article className="panel form-panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">LOGIN REQUIRED</p>
                  <h2>로그인 후 판매 글을 등록할 수 있습니다</h2>
                </div>
              </div>
              <p className="muted">회원 로그인 후 카테고리, 게임, 수량, 금액 정보를 입력해 거래소에 바로 등록할 수 있습니다.</p>
              <div className="chip-row">
                <Link className="button button--dark" href={`/login?next=${encodeURIComponent("/sell")}`}>
                  로그인
                </Link>
                <Link className="button button--light" href="/signup">
                  회원가입
                </Link>
              </div>
            </article>
          )}

          <aside className="panel side-info">
            <p className="eyebrow">SELLER CHECK</p>
            <h3>판매 전 확인 사항</h3>
            <ul className="bullet-list">
              <li>게임, 서버, 수량, 금액이 실제 보유 정보와 일치하는지 확인해 주세요.</li>
              <li>댓글 문의가 오면 거래 조건과 전달 가능 시간을 다시 확인해 주세요.</li>
              <li>거래가 끝나면 상세 화면에서 거래완료 상태로 전환해 주세요.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
