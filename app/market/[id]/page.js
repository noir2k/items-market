import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById, getListingIds } from "../../../lib/listings";

export async function generateStaticParams() {
  return getListingIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = getListingById(id);

  if (!item) {
    return {
      title: "거래 상세 | ITEMMARKET"
    };
  }

  return {
    title: `${item.title} | ITEMMARKET`,
    description: `${item.game} ${item.server} 거래 상세 페이지`
  };
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params;
  const item = getListingById(id);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래 상세 정보와 안전거래 절차를 확인하세요</span>
          <Link href="/market">목록으로 돌아가기</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">ITEM DETAIL</p>
          <h1>거래 상세</h1>
          <p>상품 정보, 판매자 신뢰도, 전달 조건을 확인하고 안전하게 거래를 진행할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <section className="detail-summary">
            <div className="detail-box">
              <div className="listing-badges">
                {item.badges.map((badge, index) => (
                  <span className={index === 0 ? "badge" : "badge badge--neutral"} key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
              <h2>{item.title}</h2>
              <div className="detail-summary__meta">
                <span className="chip">{item.game}</span>
                <span className="chip">{item.server}</span>
                <span className="chip">{item.category}</span>
              </div>
              <p className="muted">{item.summary}</p>
            </div>

            <div className="detail-box">
              <h3>상품 정보</h3>
              <div className="detail-meta-list">
                <span>거래 게임</span>
                <strong>{item.game}</strong>
              </div>
              <div className="detail-meta-list">
                <span>서버 / 월드</span>
                <strong>{item.server}</strong>
              </div>
              <div className="detail-meta-list">
                <span>재고 / 조건</span>
                <strong>{item.stock}</strong>
              </div>
              <div className="detail-meta-list">
                <span>전달 예상</span>
                <strong>{item.delivery}</strong>
              </div>
            </div>

            <div className="detail-box">
              <h3>안전거래 안내</h3>
              <ul className="bullet-list">
                <li>구매 전 서버명, 캐릭터명, 수량을 반드시 재확인합니다.</li>
                <li>결제 보관 후 전달 확인 절차에 따라 거래가 진행됩니다.</li>
                <li>거래가 끝난 뒤에는 완료 상태와 정산 내역을 다시 확인해 주세요.</li>
              </ul>
            </div>
          </section>

          <aside className="seller-card">
            <div>
              <p className="eyebrow">PRICE</p>
              <h3>거래 금액</h3>
            </div>
            <div className="detail-pricing__row">
              <span>판매가</span>
              <strong>{item.price}</strong>
            </div>
            <div className="detail-pricing__row">
              <span>판매자</span>
              <span>{item.seller}</span>
            </div>
            <div className="detail-pricing__row">
              <span>신뢰도</span>
              <span>{item.rating}</span>
            </div>
            <div className="seller-stats">
              <span>최근 거래 빠름</span>
              <span>응답 우수</span>
            </div>
            <Link className="button button--dark button--full" href="/buy">
              구매 문의하기
            </Link>
            <Link className="button button--light button--full" href="/market">
              목록으로 돌아가기
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
