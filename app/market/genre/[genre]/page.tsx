import Link from "next/link";
import { notFound } from "next/navigation";
import { GameHubCard } from "../../../../components/GameHubCard";
import { GENRE_DISPLAY_ORDER } from "../../../../components/GameGenreSection";
import { listGameBoardStats } from "../../../../lib/market-server";
import type { GameGenre } from "../../../../lib/types";

const GENRE_LABELS: Record<GameGenre, { eyebrow: string; title: string; description?: string }> = {
  mmorpg_pc: {
    description: "메이플스토리, 로스트아크, 리니지/리니지2, 던전앤파이터 등 PC MMORPG 전체",
    eyebrow: "MMORPG · PC",
    title: "PC MMORPG"
  },
  mmorpg_mobile: {
    description: "리니지M / W / 2M 시리즈 + 오딘 등 모바일 MMO 전체",
    eyebrow: "MMORPG · MOBILE",
    title: "모바일 MMORPG"
  },
  rpg_mobile: {
    description: "원신, 명조, 붕괴: 스타레일, 명일방주 등 모바일 RPG 전체",
    eyebrow: "RPG · MOBILE",
    title: "모바일 RPG"
  },
  action: {
    description: "POE 시리즈, 디아블로 시리즈 등 액션 RPG 전체",
    eyebrow: "ACTION",
    title: "액션 RPG"
  },
  sports: {
    description: "FC Online 등 스포츠 매니지먼트 전체",
    eyebrow: "SPORTS",
    title: "스포츠"
  },
  fps: {
    description: "발로란트, 오버워치 등 FPS 전체",
    eyebrow: "FPS",
    title: "FPS / 슈팅"
  },
  moba: {
    description: "리그 오브 레전드 등 MOBA 전체",
    eyebrow: "MOBA",
    title: "MOBA"
  },
  casual: { eyebrow: "CASUAL", title: "캐주얼" },
  other: { eyebrow: "OTHER", title: "기타" }
};

function isValidGenre(value: string): value is GameGenre {
  return (GENRE_DISPLAY_ORDER as string[]).includes(value);
}

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!isValidGenre(genre)) {
    return { title: "장르 게시판 | ITEM ODIN" };
  }
  return {
    description: `${GENRE_LABELS[genre].title} 전체 게시판 목록`,
    title: `${GENRE_LABELS[genre].title} 전체 | ITEM ODIN`
  };
}

export default async function GenreAllPage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  if (!isValidGenre(genre)) {
    notFound();
  }

  const allStats = await listGameBoardStats();
  const stats = allStats.filter((stat) => (stat.game.genre ?? "other") === genre);
  if (stats.length === 0) {
    notFound();
  }

  const meta = GENRE_LABELS[genre];
  const totalOpen = stats.reduce((sum, stat) => sum + stat.openPosts, 0);

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>{meta.title} 전체 게시판입니다</span>
          <Link href="/market">전체 거래소 허브</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <div className="page-hero__row">
            <Link className="page-hero__back" href="/market">
              ← 전체 거래소 허브
            </Link>
          </div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <h1>{meta.title} 전체</h1>
          <p>
            {stats.length}개 게임 · 거래중 {totalOpen.toLocaleString("ko-KR")}건. 게시판 카드를 클릭해 해당 게임의 거래
            글로 이동합니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="game-hub-grid">
            {stats.map((stat) => (
              <GameHubCard key={stat.game.slug} stat={stat} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
