import Link from "next/link";
import { ListingGrid } from "../components/ListingGrid";
import { HeroSearchCard } from "../components/HeroSearchCard";
import { listFeaturedMarketPosts } from "../lib/market-server";

const categories = [
  {
    title: "게임머니",
    description: "소액부터 대량까지 빠르게 거래"
  },
  {
    title: "아이템",
    description: "장비, 재료, 쿠폰, 강화권 거래"
  },
  {
    title: "계정",
    description: "레벨, 전투력, 컬렉션 계정 거래"
  },
  {
    title: "기타",
    description: "대리, 패키지, 길드 양도 등"
  },
  {
    title: "안전거래",
    description: "거래 절차, 주의사항, FAQ"
  }
];

const notices = [
  "서버명 / 캐릭터명 확인 후 거래를 진행해 주세요.",
  "판매 등록 후 상세 댓글로 거래 문의를 받을 수 있습니다.",
  "안전거래 절차와 주의사항은 이용안내에서 확인할 수 있습니다.",
  "계정 거래는 상세 조건과 보유 내역을 정확히 기재해 주세요."
];
const safetyItems = [
  "거래 전 서버명, 캐릭터명, 수량을 다시 확인",
  "상세 페이지에서 작성자와 거래 조건을 한 번에 확인",
  "실시간 등록 물품과 카테고리를 빠르게 탐색"
];

export default async function HomePage() {
  const featuredListings = await listFeaturedMarketPosts();

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>게임별 삽니다/팝니다 거래 글을 빠르게 확인하세요</span>
          <Link href="/guide">이용안내</Link>
        </div>
      </section>

      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">NO.1 GAME MARKET</p>
            <h1>
              게임 아이템 · 게임머니 · 계정 거래
              <br />
              원하는 게임을 바로 검색해보세요
            </h1>
            <p className="hero__copy">
              메이플스토리, 리니지M, FC Online, 로스트아크 등 주요 게임의 아이템, 게임머니,
              계정 거래를 한 곳에서 확인할 수 있습니다.
            </p>

            <div className="hero__actions">
              <Link className="button button--dark" href="/market">
                거래소 바로가기
              </Link>
              <Link className="button button--light" href="/sell">
                판매등록
              </Link>
            </div>
          </div>

          <HeroSearchCard />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CATEGORIES</p>
              <h2>주요 거래 카테고리</h2>
            </div>
            <Link className="text-link" href="/market">
              전체 카테고리 보기
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                className="category-card"
                href={category.title === "안전거래" ? "/guide" : "/market"}
                key={category.title}
              >
                <strong>{category.title}</strong>
                <span>{category.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="home-highlights">
            <article className="panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">SAFE TRADE</p>
                  <h3>안전거래 체크</h3>
                </div>
                <Link className="text-link" href="/guide">
                  자세히 보기
                </Link>
              </div>
              <ul className="bullet-list">
                {safetyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">NOTICE</p>
                  <h3>공지사항</h3>
                </div>
                <Link className="text-link" href="/guide">
                  더보기
                </Link>
              </div>
              <div className="notice-list">
                {notices.map((notice) => (
                  <Link href="/guide" key={notice}>
                    {notice}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIVE MARKET</p>
              <h2>추천 거래 물품</h2>
            </div>
            <Link className="text-link" href="/market">
              실시간 거래 더보기
            </Link>
          </div>
          {featuredListings.length > 0 ? (
            <ListingGrid items={featuredListings} />
          ) : (
            <div className="empty-state">
              <strong>표시할 추천 거래 글이 없습니다.</strong>
              <p>거래 글이 등록되면 이 영역에 최신 오픈 게시글이 노출됩니다.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          <article className="panel panel--dark">
            <p className="eyebrow eyebrow--light">SERVICE</p>
            <h2>28개 게임 거래소 + 신뢰 시스템으로 매 단계 안전하게</h2>
            <ul className="bullet-list bullet-list--light">
              <li>PC MMORPG · 모바일 RPG · MOBA까지 28개 게임을 장르별 허브에서 한눈에</li>
              <li>팝니다 · 삽니다 양방향 등록 + 댓글 즉시 협상으로 거래 흐름 단축</li>
              <li>신뢰등급 뱃지 · 거래 진행 타임라인 · 안전거래 체크리스트로 단계별 검증</li>
            </ul>
          </article>

          <article className="panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">CUSTOMER</p>
                <h3>도움말 / 바로가기</h3>
              </div>
              <Link className="text-link" href="/guide">
                더보기
              </Link>
            </div>
            <div className="notice-list">
              <Link href="/guide">안전거래 절차 확인</Link>
              <Link href="/sell">판매 물품 등록하기</Link>
              <Link href="/buy">구매 요청 등록하기</Link>
              <Link href="/guide">자주 묻는 질문과 운영 정책</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
