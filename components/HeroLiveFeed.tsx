import Link from "next/link";
import { getGameIconUrlBySlug } from "../lib/game-icon";
import type { MarketPost } from "../lib/types";

interface HeroLiveFeedProps {
  posts: MarketPost[];
}

/**
 * Hero 우측 패널 하단 — 방금 등록된 거래 5건 list.
 * 이전 carousel(1건씩 자동 슬라이드)은 시각 비중이 작아 panel에 빈 공간이 남는 문제가 있어
 * 5건을 동시에 list로 노출하는 형태로 단순화. server component (use client 불필요).
 */
export function HeroLiveFeed({ posts }: HeroLiveFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="hero-feature__live hero-feature__live--empty">
        <div className="hero-feature__live-head">
          <span aria-hidden="true" className="hero-feature__live-dot">●</span>
          <strong>LIVE</strong>
          <span>방금 등록된 거래</span>
        </div>
        <p className="muted">등록된 거래 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="hero-feature__live">
      <div className="hero-feature__live-head">
        <span aria-hidden="true" className="hero-feature__live-dot">●</span>
        <strong>LIVE</strong>
        <span>방금 등록된 거래</span>
      </div>
      <ul className="hero-feature__live-list">
        {posts.map((post) => {
          const iconUrl = getGameIconUrlBySlug(post.gameSlug);
          return (
            <li key={post.id}>
              <Link className="hero-feature__live-card" href={`/market/${post.id}`}>
                {iconUrl ? (
                  <img alt="" aria-hidden="true" className="hero-feature__live-icon" src={iconUrl} />
                ) : (
                  <span aria-hidden="true" className="hero-feature__live-icon hero-feature__live-icon--placeholder">
                    {post.game.charAt(0)}
                  </span>
                )}
                <div className="hero-feature__live-body">
                  <strong>{post.title}</strong>
                  <span className="hero-feature__live-meta">
                    {post.price} · {post.game} · {post.updatedAt}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
