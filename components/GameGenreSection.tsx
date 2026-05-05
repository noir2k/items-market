import Link from "next/link";
import { GameHubCard } from "./GameHubCard";
import type { GameBoardStat, GameGenre } from "../lib/types";

interface GameGenreSectionProps {
  genre: GameGenre;
  stats: GameBoardStat[];
}

/**
 * 4×3 = 12 cells. 게임 수가 11 이하면 그대로, 12개 이상이면 11 카드 + 1 "더보기" 카드를
 * 마지막 자리에 배치하여 장르 전체보기 페이지로 link.
 */
const MAX_GAME_CARDS = 11;

const GENRE_LABELS: Record<GameGenre, { eyebrow: string; title: string; description?: string }> = {
  mmorpg_pc: {
    description: "메이플스토리, 로스트아크, 리니지/리니지2, 던전앤파이터 등 PC MMORPG",
    eyebrow: "MMORPG · PC",
    title: "PC MMORPG"
  },
  mmorpg_mobile: {
    description: "리니지M / W / 2M 시리즈 + 오딘 등 모바일 MMO",
    eyebrow: "MMORPG · MOBILE",
    title: "모바일 MMORPG"
  },
  rpg_mobile: {
    description: "원신, 명조, 붕괴: 스타레일 등 오픈월드 / 가챠 RPG",
    eyebrow: "RPG · MOBILE",
    title: "모바일 RPG"
  },
  action: {
    description: "POE, 디아블로 시리즈 등 핵 앤 슬래시 액션 RPG",
    eyebrow: "ACTION",
    title: "액션 RPG"
  },
  sports: {
    description: "FC Online 등 스포츠 매니지먼트 / 시뮬레이션",
    eyebrow: "SPORTS",
    title: "스포츠"
  },
  fps: {
    description: "발로란트, 오버워치 등 1인칭 슈팅",
    eyebrow: "FPS",
    title: "FPS / 슈팅"
  },
  moba: {
    description: "리그 오브 레전드 등 멀티플레이어 온라인 배틀 아레나",
    eyebrow: "MOBA",
    title: "MOBA"
  },
  casual: {
    eyebrow: "CASUAL",
    title: "캐주얼"
  },
  other: {
    eyebrow: "OTHER",
    title: "기타"
  }
};

export const GENRE_DISPLAY_ORDER: GameGenre[] = [
  "mmorpg_pc",
  "mmorpg_mobile",
  "rpg_mobile",
  "action",
  "sports",
  "fps",
  "moba",
  "casual",
  "other"
];

export function GameGenreSection({ genre, stats }: GameGenreSectionProps) {
  const meta = GENRE_LABELS[genre];
  const showMoreCard = stats.length > MAX_GAME_CARDS;
  const visibleStats = showMoreCard ? stats.slice(0, MAX_GAME_CARDS) : stats;
  const hiddenCount = stats.length - visibleStats.length;

  return (
    <section className="genre-section">
      <header className="genre-section__head">
        <p className="eyebrow">{meta.eyebrow}</p>
        <h2>
          {meta.title}
          <span className="genre-section__count"> · {stats.length.toLocaleString("ko-KR")}개 게임</span>
        </h2>
        {meta.description ? <p className="muted">{meta.description}</p> : null}
      </header>
      <div className="game-hub-grid">
        {visibleStats.map((stat) => (
          <GameHubCard key={stat.game.slug} stat={stat} />
        ))}
        {showMoreCard ? (
          <Link className="game-hub-card game-hub-card--more" href={`/market/genre/${genre}`}>
            <div className="game-hub-card__head">
              <span aria-hidden="true" className="game-hub-card__icon game-hub-card__icon--placeholder">+</span>
              <strong className="game-hub-card__name">+{hiddenCount.toLocaleString("ko-KR")}개 더 보기</strong>
              <span aria-hidden="true" className="game-hub-card__cta">→</span>
            </div>
            <div className="game-hub-card__metric">
              <span>{meta.title} 전체 게시판</span>
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
