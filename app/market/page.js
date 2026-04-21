import Link from "next/link";
import { ListingGrid } from "../../components/ListingGrid";
import { MarketTable } from "../../components/MarketTable";
import { getListings } from "../../lib/listings";

export const metadata = {
  title: "거래소 | ITEMMARKET"
};

const categories = ["전체", "게임머니", "아이템", "계정", "기타"];
const games = ["메이플스토리", "리니지M", "FC Online", "로스트아크", "던전앤파이터"];

export default function MarketPage() {
  const listings = getListings();

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>실시간 등록 물품과 카테고리를 빠르게 탐색하세요</span>
          <Link href="/sell">판매등록 바로가기</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">MARKET BOARD</p>
          <h1>거래소</h1>
          <p>
            카테고리, 게임명, 서버 정보를 조합해 거래 목록을 탐색하고 원하는 물품을 빠르게
            찾을 수 있습니다.
          </p>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="filter-panel">
            <div className="filter-row">
              <strong>거래유형</strong>
              <div className="chip-row">
                {categories.map((category, index) => (
                  <button
                    className={`chip chip--interactive${index === 0 ? " chip--active" : ""}`}
                    key={category}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <strong>인기 게임</strong>
              <div className="chip-row">
                {games.map((game) => (
                  <span className="chip" key={game}>
                    {game}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FEATURED</p>
              <h2>추천 거래</h2>
            </div>
            <Link className="text-link" href="/guide">
              거래 프로세스 보기
            </Link>
          </div>
          <ListingGrid items={listings} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TABLE VIEW</p>
              <h2>리스트형 거래 현황</h2>
            </div>
          </div>
          <MarketTable items={listings} />
        </div>
      </section>
    </main>
  );
}
