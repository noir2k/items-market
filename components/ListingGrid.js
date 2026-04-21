import Link from "next/link";

function BadgeList({ badges }) {
  return (
    <div className="listing-badges">
      {badges.map((badge, index) => (
        <span className={index === 0 ? "badge" : "badge badge--neutral"} key={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
}

export function ListingGrid({ items }) {
  return (
    <div className="listing-grid">
      {items.map((item) => (
        <article className="listing-card" key={item.id}>
          <div className="listing-card__top">
            <div>
              <BadgeList badges={item.badges} />
              <h3>
                <Link href={`/market/${item.id}`}>{item.title}</Link>
              </h3>
            </div>
            <span className="chip">{item.category}</span>
          </div>
          <div className="listing-meta">
            {item.game} · {item.server}
          </div>
          <p className="muted">{item.summary}</p>
          <div className="listing-card__bottom">
            <div>
              <div className="listing-price">{item.price}</div>
              <div className="listing-meta">{item.stock}</div>
            </div>
            <Link className="button button--light" href={`/market/${item.id}`}>
              상세 보기
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
