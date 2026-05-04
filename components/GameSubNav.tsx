import Link from "next/link";
import { getGameTagClass } from "../lib/market-utils";
import type { MarketGameOption } from "../lib/types";

interface GameSubNavProps {
  activeSlug?: string;
  games: MarketGameOption[];
}

export function GameSubNav({ activeSlug, games }: GameSubNavProps) {
  return (
    <nav className="game-subnav" aria-label="게임 게시판 이동">
      <Link
        className={`game-subnav__item${!activeSlug ? " game-subnav__item--active" : ""}`}
        href="/market"
      >
        <span>전체 허브</span>
      </Link>
      {games.map((game) => {
        const isActive = activeSlug === game.slug;
        // active일 때는 game-tag 색 변형을 끄고 accent 통일 (대비 보장).
        const colorClass = isActive ? "game-subnav__item--active" : getGameTagClass(game.slug);
        return (
          <Link
            className={`game-subnav__item ${colorClass}`}
            href={`/market/game/${game.slug}`}
            key={game.slug}
          >
            <span>{game.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
