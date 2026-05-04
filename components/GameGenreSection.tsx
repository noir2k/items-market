import { GameHubCard } from "./GameHubCard";
import type { GameBoardStat, GameGenre } from "../lib/types";

interface GameGenreSectionProps {
  genre: GameGenre;
  stats: GameBoardStat[];
}

const GENRE_LABELS: Record<GameGenre, { eyebrow: string; title: string; description?: string }> = {
  mmorpg_pc: {
    description: "메이플스토리, 로스트아크, 던전앤파이터 등 PC MMORPG",
    eyebrow: "MMORPG · PC",
    title: "PC MMORPG"
  },
  mmorpg_mobile: {
    description: "리니지M / W / 2M 시리즈 + 오딘 등 모바일 MMO",
    eyebrow: "MMORPG · MOBILE",
    title: "모바일 MMORPG"
  },
  rpg_mobile: {
    description: "원신, 명일방주 등 수집형/스토리 모바일 RPG",
    eyebrow: "RPG · MOBILE",
    title: "모바일 RPG"
  },
  action: {
    description: "디아블로 시리즈 등 액션 RPG",
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

  return (
    <section className="genre-section">
      <header className="genre-section__head">
        <p className="eyebrow">{meta.eyebrow}</p>
        <h2>{meta.title}</h2>
        {meta.description ? <p className="muted">{meta.description}</p> : null}
      </header>
      <div className="game-hub-grid">
        {stats.map((stat) => (
          <GameHubCard key={stat.game.slug} stat={stat} />
        ))}
      </div>
    </section>
  );
}
