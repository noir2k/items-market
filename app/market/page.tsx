import Link from "next/link";
import { MarketBoard } from "../../components/MarketBoard";
import { listMarketGameOptions, listMarketPosts } from "../../lib/market-server";
import { marketCategories } from "../../lib/market-utils";

export const metadata = {
  title: "거래소 | ITEMMARKET"
};

type MarketSearchParams = {
  category?: string;
  game?: string;
  q?: string;
  server?: string;
  status?: string;
  tradeType?: string;
};

export default async function MarketPage({
  searchParams
}: {
  searchParams: Promise<MarketSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const [posts, games] = await Promise.all([listMarketPosts(), listMarketGameOptions()]);

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>게임별 거래 게시판과 댓글 문의 흐름을 한 화면에서 탐색하세요</span>
          <Link href="/sell">팝니다 글 등록</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">MARKET BOARD</p>
          <h1>거래소</h1>
          <p>
            게임별 카테고리와 삽니다 / 팝니다 게시글을 분리해 보고, 댓글 문의와 거래완료
            흐름까지 고려한 게시판 UI입니다.
          </p>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <MarketBoard
            categories={marketCategories}
            games={games}
            initialCategory={resolvedSearchParams.category}
            initialGame={resolvedSearchParams.game}
            initialKeyword={resolvedSearchParams.q}
            initialServer={resolvedSearchParams.server}
            initialStatus={resolvedSearchParams.status}
            initialTradeType={resolvedSearchParams.tradeType}
            posts={posts}
          />
        </div>
      </section>
    </main>
  );
}
