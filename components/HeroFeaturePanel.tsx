import Link from "next/link";
import { listFeaturedMarketPosts, listGameBoardStats } from "../lib/market-server";
import { HeroLiveFeed } from "./HeroLiveFeed";
import { HeroPopularGames } from "./HeroPopularGames";

const POPULAR_GAME_LIMIT = 6;
const LIVE_FEED_LIMIT = 5;

/**
 * 메인 페이지 hero 우측 패널 — 기존 HeroSearchCard 대체.
 *
 * 상단: 인기 게시판 6개 (수평 strip) — listGameBoardStats를 거래중 글 많은 순으로 정렬
 * 하단: "방금 등록된 거래" 라이브 피드 (vertical carousel, 4초 자동 전환)
 */
export async function HeroFeaturePanel() {
  const [stats, posts] = await Promise.all([
    listGameBoardStats(),
    listFeaturedMarketPosts(LIVE_FEED_LIMIT)
  ]);

  const popularGames = [...stats]
    .sort((a, b) => {
      if (b.openPosts !== a.openPosts) return b.openPosts - a.openPosts;
      return b.totalPosts - a.totalPosts;
    })
    .slice(0, POPULAR_GAME_LIMIT);

  return (
    <aside className="hero-feature">
      <HeroPopularGames stats={popularGames} />
      <div aria-hidden="true" className="hero-feature__divider" />
      <HeroLiveFeed posts={posts} />
      <Link className="hero-feature__more" href="/market">
        거래소 전체 보기 →
      </Link>
    </aside>
  );
}
