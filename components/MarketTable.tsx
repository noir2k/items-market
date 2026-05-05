import Link from "next/link";
import { getGameIconUrlBySlug } from "../lib/game-icon";
import { getGameTagClass, getStatusLabel, getTradeTypeLabel } from "../lib/market-utils";
import type { MarketPost } from "../lib/types";

export function MarketTable({ items }: { items: MarketPost[] }) {
  return (
    <div className="market-table">
      <div className="market-table__header" aria-hidden="true">
        <span>제목</span>
        <span>거래</span>
        <span>상태</span>
        <span>작성자</span>
        <span>댓글</span>
        <span>금액</span>
      </div>
      {items.map((item) => (
        <article className="market-table__row" key={item.id}>
          <div className="market-table__main">
            <strong>
              <Link href={`/market/${item.id}`}>{item.title}</Link>
            </strong>
            <div className="market-table__meta">
              <span className={`game-tag ${getGameTagClass(item.gameSlug)}`}>
                {(() => {
                  const iconUrl = getGameIconUrlBySlug(item.gameSlug);
                  return iconUrl ? (
                    <img alt="" aria-hidden="true" className="game-tag__icon" src={iconUrl} />
                  ) : null;
                })()}
                {item.game}
              </span>
              {" · "}
              {item.server} · {item.category} · {item.quantity}
            </div>
          </div>
          <span className={`market-table__pill market-table__pill--${item.tradeType}`}>
            {getTradeTypeLabel(item.tradeType)}
          </span>
          <span className={`market-table__pill market-table__pill--status-${item.status}`}>
            {getStatusLabel(item.status)}
          </span>
          <span className="market-table__text">{item.authorName}</span>
          <span className="market-table__text">댓글 {item.commentCount}</span>
          <strong className="market-table__price">{item.price}</strong>
        </article>
      ))}
    </div>
  );
}
