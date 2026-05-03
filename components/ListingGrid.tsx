import Link from "next/link";
import { getStatusLabel, getTradeTypeLabel } from "../lib/market-utils";
import type { MarketPost } from "../lib/types";

function BadgeList({ badges }: { badges: string[] }) {
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

export function ListingGrid({ items }: { items: MarketPost[] }) {
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
            <div className="listing-card__chips">
              <span className={`chip ${item.tradeType === "buy" ? "chip--accent" : ""}`}>
                {getTradeTypeLabel(item.tradeType)}
              </span>
              <span className={`chip ${item.status === "closed" ? "chip--muted" : ""}`}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          </div>
          <div className="listing-meta">
            {item.game} · {item.server} · {item.category}
          </div>
          <p className="muted">{item.summary}</p>
          <div className="listing-card__bottom">
            <div>
              <div className="listing-price">{item.price}</div>
              <div className="listing-meta">
                {item.quantity} · 댓글 {item.commentCount} · {item.updatedAt}
              </div>
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
