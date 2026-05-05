import Link from "next/link";
import { GameGenreSection, GENRE_DISPLAY_ORDER } from "../../components/GameGenreSection";
import { MarketGameQuickNav } from "../../components/MarketGameQuickNav";
import { listGameBoardStats } from "../../lib/market-server";
import type { GameBoardStat, GameGenre } from "../../lib/types";

export const metadata = {
  title: "거래소 | ITEM ODIN"
};

function groupStatsByGenre(stats: GameBoardStat[]): Map<GameGenre, GameBoardStat[]> {
  const groups = new Map<GameGenre, GameBoardStat[]>();
  for (const stat of stats) {
    const genre = stat.game.genre ?? "other";
    const bucket = groups.get(genre) ?? [];
    bucket.push(stat);
    groups.set(genre, bucket);
  }
  return groups;
}

export default async function MarketPage() {
  const stats = await listGameBoardStats();
  const totalOpen = stats.reduce((sum, stat) => sum + stat.openPosts, 0);
  const totalGames = stats.length;
  const groups = groupStatsByGenre(stats);

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래하고 싶은 게임을 선택해 게시판으로 이동하세요</span>
          <Link href="/sell">팝니다 글 등록</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">MARKET HUB</p>
          <h1>거래소</h1>
          <p>
            {totalGames}개 게임 · 거래중 {totalOpen.toLocaleString("ko-KR")}건. 장르별 섹션에서 원하는 게임을 선택해 게시판으로 이동합니다.
          </p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container">
          <MarketGameQuickNav stats={stats} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {GENRE_DISPLAY_ORDER.map((genre) => {
            const sectionStats = groups.get(genre);
            if (!sectionStats || sectionStats.length === 0) return null;
            return <GameGenreSection key={genre} genre={genre} stats={sectionStats} />;
          })}
        </div>
      </section>
    </main>
  );
}
