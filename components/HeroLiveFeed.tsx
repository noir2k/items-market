"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGameIconUrlBySlug } from "../lib/game-icon";
import type { MarketPost } from "../lib/types";

const SLIDE_INTERVAL_MS = 4000;
const CARD_HEIGHT = 84;

interface HeroLiveFeedProps {
  posts: MarketPost[];
}

/**
 * Hero 우측 패널 하단 — "방금 등록된 거래" 라이브 피드.
 * Vertical carousel: 카드 stack을 transform: translateY로 슬라이드.
 * 4초마다 자동 전환, hover 시 일시정지(a11y).
 */
export function HeroLiveFeed({ posts }: HeroLiveFeedProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || posts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % posts.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, posts.length]);

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
    <div
      className="hero-feature__live"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-feature__live-head">
        <span aria-hidden="true" className="hero-feature__live-dot">●</span>
        <strong>LIVE</strong>
        <span>방금 등록된 거래</span>
      </div>

      <div
        aria-live="polite"
        className="hero-feature__live-track"
        style={{ height: `${CARD_HEIGHT}px` }}
      >
        <div
          className="hero-feature__live-stack"
          style={{ transform: `translateY(-${index * CARD_HEIGHT}px)` }}
        >
          {posts.map((post, i) => {
            const iconUrl = getGameIconUrlBySlug(post.gameSlug);
            return (
              <Link
                aria-hidden={i !== index}
                className="hero-feature__live-card"
                href={`/market/${post.id}`}
                key={post.id}
                style={{ height: `${CARD_HEIGHT}px` }}
                tabIndex={i === index ? 0 : -1}
              >
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
            );
          })}
        </div>
      </div>

      <div aria-label="라이브 피드 navigation" className="hero-feature__live-dots" role="tablist">
        {posts.map((_, i) => (
          <button
            aria-label={`${i + 1}번째 거래 보기`}
            aria-selected={i === index}
            className={`hero-feature__live-dot-btn${i === index ? " is-active" : ""}`}
            key={i}
            onClick={() => setIndex(i)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
