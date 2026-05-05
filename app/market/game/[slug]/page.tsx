import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketBoard } from "../../../../components/MarketBoard";
import { MarketGameQuickNav } from "../../../../components/MarketGameQuickNav";
import { listGameBoardStats, listMarketGameOptions, listMarketPostsByGameSlug } from "../../../../lib/market-server";

type GameBoardSearchParams = {
  category?: string;
  q?: string;
  server?: string;
  status?: string;
  tradeType?: string;
};

async function getGameBoardContext(slug: string) {
  const [posts, games, stats] = await Promise.all([
    listMarketPostsByGameSlug(slug),
    listMarketGameOptions(),
    listGameBoardStats()
  ]);
  const game = games.find((item) => item.slug === slug);

  return {
    game,
    games,
    posts,
    stats
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { game } = await getGameBoardContext(slug);

  if (!game) {
    return {
      title: "게임 게시판 | ITEM ODIN"
    };
  }

  return {
    description: `${game.name} 삽니다 / 팝니다 거래 게시판`,
    title: `${game.name} 게시판 | ITEM ODIN`
  };
}

export default async function GameBoardPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<GameBoardSearchParams>;
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { game, games, posts, stats } = await getGameBoardContext(slug);

  if (!game) {
    notFound();
  }

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>{game.name} 전용 삽니다 / 팝니다 게시판입니다</span>
          <Link href="/market">전체 거래소</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <div className="page-hero__row">
            <Link className="page-hero__back" href="/market">
              ← 전체 거래소 허브
            </Link>
          </div>
          <p className="eyebrow">GAME BOARD</p>
          <h1>{game.name} 게시판</h1>
          <p>이 게임의 거래 글만 모아 일반 게시판 목록으로 확인하고 거래 문의를 이어갈 수 있습니다.</p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container">
          <MarketGameQuickNav activeSlug={slug} stats={stats} />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <MarketBoard
            games={games}
            initialCategory={resolvedSearchParams.category}
            initialGame={game.name}
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
