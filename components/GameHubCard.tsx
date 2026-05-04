import Link from "next/link";
import { getGameTagClass } from "../lib/market-utils";
import type { GameBoardStat } from "../lib/types";

interface GameHubCardProps {
  stat: GameBoardStat;
}

const numberFormatter = new Intl.NumberFormat("ko-KR");

export function GameHubCard({ stat }: GameHubCardProps) {
  return (
    <Link className={`game-hub-card ${getGameTagClass(stat.game.slug)}`} href={`/market/game/${stat.game.slug}`}>
      <div className="game-hub-card__head">
        <span className="game-tag-large">{stat.game.name}</span>
        <span className="game-hub-card__cta">게시판 열기 →</span>
      </div>
      <div className="game-hub-card__stats">
        <div className="game-hub-card__metric">
          <strong>{numberFormatter.format(stat.totalPosts)}</strong>
          <span>전체 글</span>
        </div>
        <div className="game-hub-card__metric">
          <strong>{numberFormatter.format(stat.openPosts)}</strong>
          <span>거래중</span>
        </div>
        <div className="game-hub-card__metric game-hub-card__metric--sell">
          <strong>{numberFormatter.format(stat.sellPosts)}</strong>
          <span>팝니다</span>
        </div>
        <div className="game-hub-card__metric game-hub-card__metric--buy">
          <strong>{numberFormatter.format(stat.buyPosts)}</strong>
          <span>삽니다</span>
        </div>
      </div>
    </Link>
  );
}
