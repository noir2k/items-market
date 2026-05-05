import Link from "next/link";
import { getGameIconUrl } from "../lib/game-icon";
import { getGameTagClass } from "../lib/market-utils";
import type { GameBoardStat } from "../lib/types";

interface GameHubCardProps {
  stat: GameBoardStat;
}

const numberFormatter = new Intl.NumberFormat("ko-KR");

export function GameHubCard({ stat }: GameHubCardProps) {
  const iconUrl = getGameIconUrl(stat.game.iconPath);
  const initial = stat.game.name.charAt(0);

  return (
    <Link
      className={`game-hub-card ${getGameTagClass(stat.game.slug)}`}
      href={`/market/game/${stat.game.slug}`}
    >
      <div className="game-hub-card__head">
        {iconUrl ? (
          <img
            alt=""
            aria-hidden="true"
            className="game-hub-card__icon"
            src={iconUrl}
          />
        ) : (
          <span aria-hidden="true" className="game-hub-card__icon game-hub-card__icon--placeholder">
            {initial}
          </span>
        )}
        <strong className="game-hub-card__name">{stat.game.name}</strong>
        <span aria-hidden="true" className="game-hub-card__cta">→</span>
      </div>
      <div className="game-hub-card__metric">
        <strong>{numberFormatter.format(stat.openPosts)}</strong>
        <span>거래중 게시글</span>
      </div>
    </Link>
  );
}
