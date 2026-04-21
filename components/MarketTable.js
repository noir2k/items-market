import Link from "next/link";

export function MarketTable({ items }) {
  return (
    <div className="market-table">
      {items.map((item) => (
        <article className="market-table__row" key={item.id}>
          <div className="market-table__main">
            <strong>
              <Link href={`/market/${item.id}`}>{item.title}</Link>
            </strong>
            <div className="market-table__meta">
              {item.game} · {item.server} · {item.delivery}
            </div>
          </div>
          <div className="seller-stats">
            <span>{item.seller}</span>
            <span>평점 {item.rating}</span>
            <span>{item.price}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
