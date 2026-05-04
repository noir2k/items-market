import Link from "next/link";
import { getGameTagClass } from "../lib/market-utils";
import type { GameBoardStat } from "../lib/types";

interface MarketGameQuickNavProps {
  activeSlug?: string;
  /** 거래중 글이 있는 게임 중 상위 N개만 노출 (기본 4) */
  limit?: number;
  stats: GameBoardStat[];
}

export function MarketGameQuickNav({ activeSlug, limit = 4, stats }: MarketGameQuickNavProps) {
  // 거래중 게시글이 1건 이상인 게임을 우선 노출, 그 안에서 openPosts 내림차순 → totalPosts 내림차순.
  const ranked = stats
    .filter((stat) => stat.openPosts > 0 || stat.totalPosts > 0)
    .sort((a, b) => {
      if (b.openPosts !== a.openPosts) return b.openPosts - a.openPosts;
      return b.totalPosts - a.totalPosts;
    });

  // 활성 게임이 ranked top N에 없으면 강제로 포함시켜 사용자 위치 손실 방지.
  const top = ranked.slice(0, limit);
  if (activeSlug && !top.some((stat) => stat.game.slug === activeSlug)) {
    const activeStat = stats.find((stat) => stat.game.slug === activeSlug);
    if (activeStat) {
      top.pop();
      top.push(activeStat);
    }
  }

  if (top.length === 0) {
    return null;
  }

  return (
    <nav className="game-quicknav" aria-label="인기 게시판 빠른 이동">
      <span className="game-quicknav__label">인기 게시판</span>
      <div className="game-quicknav__items">
        {top.map((stat) => {
          const isActive = activeSlug === stat.game.slug;
          const colorClass = isActive ? "game-quicknav__item--active" : getGameTagClass(stat.game.slug);
          return (
            <Link
              className={`game-quicknav__item ${colorClass}`}
              href={`/market/game/${stat.game.slug}`}
              key={stat.game.slug}
            >
              <span>{stat.game.name}</span>
              <strong>{stat.openPosts}</strong>
            </Link>
          );
        })}
      </div>
      <Link className="game-quicknav__more" href="/market">
        전체 허브 →
      </Link>
    </nav>
  );
}
