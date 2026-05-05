import Link from "next/link";
import { getGameIconUrl } from "../lib/game-icon";
import type { GameBoardStat } from "../lib/types";

interface HeroPopularGamesProps {
  stats: GameBoardStat[];
}

/**
 * Hero 우측 패널 상단 — 거래중 글이 많은 인기 게임 6개를 수평 strip으로.
 * 클릭 시 해당 게임의 보드로 즉시 이동. 모바일은 가로 스크롤(scroll-snap).
 */
export function HeroPopularGames({ stats }: HeroPopularGamesProps) {
  if (stats.length === 0) return null;

  return (
    <div className="hero-feature__games">
      <p className="eyebrow">TRENDING · 인기 게시판</p>
      <ul className="hero-feature__game-strip">
        {stats.map((stat) => {
          const iconUrl = getGameIconUrl(stat.game.iconPath);
          return (
            <li key={stat.game.slug}>
              <Link href={`/market/game/${stat.game.slug}`} title={`${stat.game.name} 게시판으로 이동`}>
                <span className="hero-feature__game-icon">
                  {iconUrl ? (
                    <img alt="" aria-hidden="true" src={iconUrl} />
                  ) : (
                    <span aria-hidden="true" className="hero-feature__game-icon-placeholder">
                      {stat.game.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="hero-feature__game-name">{stat.game.name}</span>
                <span className="hero-feature__game-count">
                  {stat.openPosts > 0 ? `${stat.openPosts}건` : "-"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
