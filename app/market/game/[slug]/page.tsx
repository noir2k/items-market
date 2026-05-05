import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketBoard } from "../../../../components/MarketBoard";
import { MarketGameQuickNav } from "../../../../components/MarketGameQuickNav";
import { getGameIconUrl } from "../../../../lib/game-icon";
import {
  listGameBoardStats,
  listMarketGameOptions,
  listMarketPostsByGameSlugLimited
} from "../../../../lib/market-server";

const INITIAL_SHOW = 30;
const SHOW_INCREMENT = 30;
const SHOW_HARD_CAP = 600;

type GameBoardSearchParams = {
  category?: string;
  q?: string;
  server?: string;
  show?: string;
  status?: string;
  tradeType?: string;
};

function parseShow(raw: string | undefined): number {
  const n = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(n) || n <= 0) return INITIAL_SHOW;
  return Math.min(SHOW_HARD_CAP, n);
}

async function getGameBoardContext(slug: string, show: number) {
  const [{ posts, totalCount }, games, stats] = await Promise.all([
    listMarketPostsByGameSlugLimited(slug, show),
    listMarketGameOptions(),
    listGameBoardStats()
  ]);
  const game = games.find((item) => item.slug === slug);

  return {
    game,
    games,
    posts,
    stats,
    totalCount
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // metadata는 게임 정보만 필요하므로 posts fetch는 최소화 (limit 1)
  const { game } = await getGameBoardContext(slug, 1);

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
  const show = parseShow(resolvedSearchParams.show);
  const { game, games, posts, stats, totalCount } = await getGameBoardContext(slug, show);

  if (!game) {
    notFound();
  }

  const iconUrl = getGameIconUrl(game.iconPath);

  // "더 보기" 링크 빌드 — 다른 query state도 보존
  const hasMore = posts.length < totalCount;
  const nextShow = Math.min(SHOW_HARD_CAP, show + SHOW_INCREMENT);
  const buildLoadMoreHref = () => {
    const sp = new URLSearchParams();
    if (resolvedSearchParams.tradeType) sp.set("tradeType", resolvedSearchParams.tradeType);
    if (resolvedSearchParams.category) sp.set("category", resolvedSearchParams.category);
    if (resolvedSearchParams.status) sp.set("status", resolvedSearchParams.status);
    if (resolvedSearchParams.q) sp.set("q", resolvedSearchParams.q);
    if (resolvedSearchParams.server) sp.set("server", resolvedSearchParams.server);
    sp.set("show", String(nextShow));
    return `/market/game/${slug}?${sp.toString()}`;
  };
  const loadMoreHref = hasMore ? buildLoadMoreHref() : null;

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
          <h1 className="page-hero__title-with-icon">
            {iconUrl ? (
              <img alt="" aria-hidden="true" className="page-hero__game-icon" src={iconUrl} />
            ) : null}
            <span>{game.name} 게시판</span>
          </h1>
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
            loadMoreHref={loadMoreHref}
            loadMoreIncrement={Math.min(SHOW_INCREMENT, totalCount - posts.length)}
            posts={posts}
            totalCount={totalCount}
          />
        </div>
      </section>
    </main>
  );
}
