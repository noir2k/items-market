import Link from "next/link";
import { GameHubCard } from "../../components/GameHubCard";
import { MarketGameQuickNav } from "../../components/MarketGameQuickNav";
import { listGameBoardStats } from "../../lib/market-server";

export const metadata = {
  title: "거래소 | ITEMMARKET"
};

export default async function MarketPage() {
  const stats = await listGameBoardStats();
  const totalOpen = stats.reduce((sum, stat) => sum + stat.openPosts, 0);
  const totalPosts = stats.reduce((sum, stat) => sum + stat.totalPosts, 0);

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
            게임 카드를 눌러 해당 게시판으로 이동합니다. 현재 전체 {totalPosts.toLocaleString("ko-KR")}건의
            거래 글 중 {totalOpen.toLocaleString("ko-KR")}건이 거래 중입니다.
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
