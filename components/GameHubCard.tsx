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

  return (
    <Link className={`game-hub-card ${getGameTagClass(stat.game.slug)}`} href={`/market/game/${stat.game.slug}`}>
      <div className="game-hub-card__head">
        <span className="game-tag-large">
          {iconUrl ? (
            <img alt="" aria-hidden="true" className="game-tag-large__icon" src={iconUrl} />
          ) : null}
          {stat.game.name}
        </span>
        <span className="game-hub-card__cta" aria-hidden="true">→</span>
      </div>
      <div className="game-hub-card__body">
        <div className="game-hub-card__metric">
          <strong>{numberFormatter.format(stat.openPosts)}</strong>
          <span>거래중 게시글</span>
        </div>
      </div>
    </Link>
  );
}
