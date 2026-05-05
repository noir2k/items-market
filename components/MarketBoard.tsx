"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  filterMarketPosts,
  getCategoryCode,
  getMarketSummary,
  marketCategoryOptions,
  type MarketCategoryFilterCode
} from "../lib/market-utils";
import type { MarketPost, MarketStatus, TradeType } from "../lib/types";
import { LoadMoreButton } from "./LoadMoreButton";
import { MarketTable } from "./MarketTable";

type TradeTypeFilter = TradeType | "all";
type StatusFilter = MarketStatus | "all";
type BoardGame = {
  name: string;
  slug?: string;
};

const tradeTypeOptions = [
  { label: "전체", value: "all" },
  { label: "팝니다", value: "sell" },
  { label: "삽니다", value: "buy" }
] as const satisfies ReadonlyArray<{ label: string; value: TradeTypeFilter }>;

const statusOptions = [
  { label: "전체 상태", value: "all" },
  { label: "거래중", value: "open" },
  { label: "거래완료", value: "closed" }
] as const satisfies ReadonlyArray<{ label: string; value: StatusFilter }>;

function isMarketCategoryFilterCode(value: string | undefined): value is MarketCategoryFilterCode {
  return marketCategoryOptions.some((option) => option.code === value);
}

export function MarketBoard({
  games,
  initialCategory,
  initialGame,
  initialKeyword,
  initialServer,
  initialStatus,
  initialTradeType,
  loadMoreHref,
  loadMoreIncrement,
  posts,
  totalCount
}: {
  games: BoardGame[];
  initialCategory?: string;
  initialGame?: string;
  initialKeyword?: string;
  initialServer?: string;
  initialStatus?: string;
  initialTradeType?: string;
  /** 다음 SSR 페이지 URL (null이면 더 이상 없음) */
  loadMoreHref?: string | null;
  /** 다음 클릭 시 로드되는 추가 건수 — 라벨용 */
  loadMoreIncrement?: number;
  posts: MarketPost[];
  /** SSR 단계 totalCount — 클라이언트 필터와 무관한 진짜 총합 */
  totalCount?: number;
}) {
  const router = useRouter();
  const [tradeType, setTradeTypeState] = useState<TradeTypeFilter>(
    initialTradeType === "buy" || initialTradeType === "sell" ? initialTradeType : "all"
  );
  const knownGameNames = new Set(games.map((item) => item.name));
  const [game, setGameState] = useState(knownGameNames.has(initialGame || "") ? initialGame || "all" : "all");
  const [status, setStatusState] = useState<StatusFilter>(
    initialStatus === "open" || initialStatus === "closed" ? initialStatus : "all"
  );
  const [category, setCategoryState] = useState<MarketCategoryFilterCode>(
    isMarketCategoryFilterCode(initialCategory) ? initialCategory : "all"
  );
  const keyword = (initialKeyword || "").trim();
  const server = (initialServer || "").trim();

  const filteredPosts = filterMarketPosts({
    category: category === "all" ? "all" : marketCategoryOptions.find((option) => option.code === category)?.label ?? "all",
    game,
    keyword,
    posts,
    server,
    status,
    tradeType
  });
  const summary = getMarketSummary(posts);

  function updateBoardUrl(nextFilters: {
    category?: MarketCategoryFilterCode;
    game?: string;
    status?: StatusFilter;
    tradeType?: TradeTypeFilter;
  }) {
    const next = {
      category,
      game,
      status,
      tradeType,
      ...nextFilters
    };
    const params = new URLSearchParams();

    if (next.tradeType && next.tradeType !== "all") params.set("tradeType", next.tradeType);
    if (next.category && next.category !== "all") params.set("category", next.category);
    if (next.status && next.status !== "all") params.set("status", next.status);
    if (keyword) params.set("q", keyword);
    if (server) params.set("server", server);

    const query = params.toString();
    const gameSlug = games.find((item) => item.name === next.game)?.slug;
    const pathname = gameSlug && next.game !== "all" ? `/market/game/${gameSlug}` : "/market";
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setGame(nextGame: string) {
    setGameState(nextGame);
    updateBoardUrl({ game: nextGame });
  }

  function setTradeType(nextTradeType: TradeTypeFilter) {
    setTradeTypeState(nextTradeType);
    updateBoardUrl({ tradeType: nextTradeType });
  }

  function setStatus(nextStatus: StatusFilter) {
    setStatusState(nextStatus);
    updateBoardUrl({ status: nextStatus });
  }

  function setCategory(nextCategory: MarketCategoryFilterCode) {
    setCategoryState(nextCategory);
    updateBoardUrl({ category: nextCategory });
  }

  return (
    <div className="board-content">
        <div className="board-meta-strip" aria-label="게시판 요약">
          <span className="board-meta-strip__item"><strong>{summary.totalCount}</strong> 전체</span>
          <span className="board-meta-strip__sep" aria-hidden="true">·</span>
          <span className="board-meta-strip__item"><strong>{summary.openCount}</strong> 거래중</span>
          <span className="board-meta-strip__sep" aria-hidden="true">·</span>
          <span className="board-meta-strip__item">
            <strong className="board-meta-strip__sell">{summary.sellCount}</strong> 팝니다 ·
            <strong className="board-meta-strip__buy"> {summary.buyCount}</strong> 삽니다
          </span>
          <span className="board-meta-strip__sep" aria-hidden="true">·</span>
          <span className="board-meta-strip__item"><strong>{summary.commentCount}</strong> 댓글</span>
          {filteredPosts.length !== summary.totalCount ? (
            <span className="board-meta-strip__filtered">
              필터 결과 {filteredPosts.length}건
            </span>
          ) : null}
        </div>

        {(keyword || server) ? (
          <div className="board-active-filters">
            {keyword ? <span className="chip chip--muted">검색어: {keyword}</span> : null}
            {server ? <span className="chip chip--muted">서버: {server}</span> : null}
            <Link className="text-link" href="/market">
              전체 조건 초기화
            </Link>
          </div>
        ) : null}

        <section className="filter-panel">
          <div className="filter-row filter-row--stack">
            <strong>거래 유형</strong>
            <div className="chip-row">
              {tradeTypeOptions.map((option) => (
                <button
                  className={`chip chip--interactive${tradeType === option.value ? " chip--active" : ""}`}
                  key={option.value}
                  onClick={() => setTradeType(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="board-toolbar">
            <label className="field">
              <span>게임</span>
              <select onChange={(event) => setGame(event.target.value)} value={game}>
                <option value="all">전체 게임</option>
                {games.map((item) => (
                  <option key={item.slug || item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>카테고리</span>
              <select
                onChange={(event) => setCategory(event.target.value as MarketCategoryFilterCode)}
                value={category}
              >
                {marketCategoryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>진행 상태</span>
              <select onChange={(event) => setStatus(event.target.value as StatusFilter)} value={status}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="section section--compact">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BOARD LIST</p>
              <h2>게시글 목록</h2>
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <MarketTable items={filteredPosts} />
          ) : (
            <div className="empty-state">
              <strong>표시할 게시글이 없습니다.</strong>
              <p>필터 조건을 바꾸거나 새 거래 글을 등록해 주세요.</p>
            </div>
          )}

          {/* "더 보기" — SSR 페이징. 클라이언트 필터로 일부가 가려진 상태여도 더 많은
              게시글이 SQL에 남아 있으면 노출. 사용자가 한 번이라도 "더 보기"를 클릭한
              뒤로는(URL show 파라미터 존재) IntersectionObserver 자동 트리거 ON. */}
          {loadMoreHref && totalCount !== undefined ? (
            <LoadMoreButton
              autoLoadWhenInView={posts.length > 30}
              fetchedCount={posts.length}
              href={loadMoreHref}
              increment={loadMoreIncrement ?? 30}
              totalCount={totalCount}
            />
          ) : null}
        </section>
    </div>
  );
}
