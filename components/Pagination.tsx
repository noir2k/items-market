import Link from "next/link";

interface PaginationProps {
  /** 1-indexed 현재 페이지 */
  page: number;
  pageSize: number;
  totalCount: number;
  /** 페이지 번호를 받아 해당 페이지의 URL을 만드는 빌더. URL은 다른 query state도 보존해야 한다. */
  buildHref: (nextPage: number) => string;
  /** 결과 카운트 라벨에 단위를 표기 (예: "건", "명") — 기본 "건" */
  unit?: string;
}

const WINDOW_SIZE = 5;

/**
 * 관리자 콘솔용 offset 페이지네이션. 5개 슬라이딩 윈도우 + 처음/끝 jump를 제공한다.
 * 사용자 결정에 따라 목록의 상하단 모두에 노출. 페이지가 1개뿐이면 카운트만 표시.
 */
export function Pagination({ page, pageSize, totalCount, buildHref, unit = "건" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(totalCount, safePage * pageSize);

  if (totalPages <= 1) {
    return (
      <div className="pagination pagination--single">
        <span className="pagination__count">
          전체 {totalCount.toLocaleString("ko-KR")}{unit}
        </span>
      </div>
    );
  }

  // 윈도우 시작/끝 계산 — 가운데 페이지 기준 5개를 노출
  const windowStart = Math.max(
    1,
    Math.min(totalPages - WINDOW_SIZE + 1, safePage - Math.floor(WINDOW_SIZE / 2))
  );
  const windowEnd = Math.min(totalPages, windowStart + WINDOW_SIZE - 1);
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  return (
    <nav aria-label="페이지 네비게이션" className="pagination">
      <span className="pagination__count">
        {rangeStart.toLocaleString("ko-KR")}–{rangeEnd.toLocaleString("ko-KR")} / 전체 {totalCount.toLocaleString("ko-KR")}{unit}
      </span>

      <div className="pagination__pages">
        <Link
          aria-disabled={safePage <= 1}
          className={`pagination__nav${safePage <= 1 ? " pagination__nav--disabled" : ""}`}
          href={safePage <= 1 ? "#" : buildHref(safePage - 1)}
          tabIndex={safePage <= 1 ? -1 : undefined}
        >
          ← 이전
        </Link>

        {windowStart > 1 ? (
          <>
            <Link className="pagination__page" href={buildHref(1)}>1</Link>
            {windowStart > 2 ? <span aria-hidden="true" className="pagination__ellipsis">…</span> : null}
          </>
        ) : null}

        {pages.map((p) => (
          <Link
            aria-current={p === safePage ? "page" : undefined}
            className={`pagination__page${p === safePage ? " is-active" : ""}`}
            href={buildHref(p)}
            key={p}
          >
            {p}
          </Link>
        ))}

        {windowEnd < totalPages ? (
          <>
            {windowEnd < totalPages - 1 ? <span aria-hidden="true" className="pagination__ellipsis">…</span> : null}
            <Link className="pagination__page" href={buildHref(totalPages)}>
              {totalPages}
            </Link>
          </>
        ) : null}

        <Link
          aria-disabled={safePage >= totalPages}
          className={`pagination__nav${safePage >= totalPages ? " pagination__nav--disabled" : ""}`}
          href={safePage >= totalPages ? "#" : buildHref(safePage + 1)}
          tabIndex={safePage >= totalPages ? -1 : undefined}
        >
          다음 →
        </Link>
      </div>
    </nav>
  );
}
