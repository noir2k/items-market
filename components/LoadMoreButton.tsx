"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface LoadMoreButtonProps {
  href: string;
  /** 다음 클릭 시 추가되는 건수 (라벨용) */
  increment: number;
  /** SSR 시점의 누적 fetch 건수 */
  fetchedCount: number;
  /** 전체 합계 (SQL count exact 기준) */
  totalCount: number;
  /**
   * 화면에 들어올 때 자동으로 다음 페이지를 로드한다.
   * 첫 진입(show=default)에서는 OFF, 사용자가 한 번이라도 "더 보기"를 클릭한 후
   * (URL에 show=N 존재) ON. 의도치 않은 자동 로드 방지.
   */
  autoLoadWhenInView?: boolean;
  /** 라벨 단위 — 기본 "건" */
  unit?: string;
}

/**
 * SSR 누적 페이징용 "더 보기" 버튼.
 * - 평소: <Link href> — 클릭 시 SSR navigate
 * - autoLoadWhenInView=true: viewport 진입 시 router.push() 자동 호출
 * - 자동 로딩 중에는 버튼이 disabled 상태로 변환되어 중복 트리거 방지
 *
 * 자동 로드 정책:
 *   첫 진입(show=default)에서는 사용자가 의도하지 않은 무한 스크롤이 부담스러우므로
 *   OFF. 사용자가 1회 클릭한 이후(`autoLoadWhenInView=true` props로 ON)부터
 *   자동 로딩 — "한 번 클릭했으면 그 이후로는 자동" UX.
 */
export function LoadMoreButton({
  autoLoadWhenInView = false,
  fetchedCount,
  href,
  increment,
  totalCount,
  unit = "건"
}: LoadMoreButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!autoLoadWhenInView) return;
    const node = buttonRef.current;
    if (!node) return;
    if (triggeredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true;
          setIsLoading(true);
          router.push(href, { scroll: false });
        }
      },
      { rootMargin: "200px" } // 화면에 닿기 200px 전 미리 fetch
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [autoLoadWhenInView, href, router]);

  const formattedFetched = fetchedCount.toLocaleString("ko-KR");
  const formattedTotal = totalCount.toLocaleString("ko-KR");
  const formattedIncrement = increment.toLocaleString("ko-KR");

  return (
    <div className="board-load-more">
      <Link
        aria-disabled={isLoading}
        className={`button button--light button--full${isLoading ? " is-loading" : ""}`}
        href={href}
        ref={buttonRef}
        scroll={false}
        tabIndex={isLoading ? -1 : undefined}
      >
        {isLoading ? (
          <>불러오는 중…</>
        ) : (
          <>
            + {formattedIncrement}{unit} 더 보기
            <span className="board-load-more__progress">
              ({formattedFetched} / {formattedTotal})
            </span>
          </>
        )}
      </Link>
    </div>
  );
}
