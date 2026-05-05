"use client";

import { usePathname } from "next/navigation";

interface AdSlotConfig {
  /** IAB 표준 라벨 (예: MEDIUM RECTANGLE / HALF PAGE) */
  label: string;
  /** 디스플레이 사이즈 (예: "300×250") */
  size: string;
  /** 픽셀 width / height */
  width: number;
  height: number;
  /** 마우스오버 hint */
  hint?: string;
}

const SLOTS: AdSlotConfig[] = [
  {
    height: 250,
    hint: "헤더 가까운 영역 — CTR 가장 높은 슬롯",
    label: "MEDIUM RECTANGLE",
    size: "300×250",
    width: 300
  },
  {
    height: 600,
    hint: "스크롤 따라 노출 — 장기 노출 / 브랜드 광고용",
    label: "HALF PAGE",
    size: "300×600",
    width: 300
  }
];

interface AdRailProps {
  side: "left" | "right";
}

function AdRail({ side }: AdRailProps) {
  return (
    <aside
      aria-label={`${side === "left" ? "좌측" : "우측"} 광고 영역 (placeholder)`}
      className={`ad-rail ad-rail--${side}`}
    >
      <p className="ad-rail__heading">SPONSORED</p>
      {SLOTS.map((slot) => (
        <div
          aria-hidden="true"
          className="ad-rail__slot"
          key={`${side}-${slot.size}-${slot.label}`}
          style={{ height: `${slot.height}px`, width: `${slot.width}px` }}
          title={slot.hint}
        >
          <span className="ad-rail__slot-tag">광고</span>
          <strong>{slot.label}</strong>
          <span className="ad-rail__slot-size">{slot.size}</span>
          {slot.hint ? <span className="ad-rail__slot-note">{slot.hint}</span> : null}
        </div>
      ))}
    </aside>
  );
}

/**
 * 일반 사용자 페이지 양쪽(좌+우) 광고 placeholder.
 *
 * 정책 (사용자 요청 — ruliweb 패턴 참고):
 *   1. 메인 영역(.container max-width 1200px)을 절대 가리지 않는다
 *   2. position: absolute (sticky/fixed 아님) — 스크롤 시 페이지와 함께 흐름
 *   3. viewport 1850px 이상 = main 1200 + (gap 24 + 광고 300) × 2 = 1848 fits
 *      → 그보다 좁으면 자동 hide되어 메인 영역만 가시
 *   4. /staff/* 콘솔에서는 노출하지 않음
 */
export function AdSidebar() {
  const pathname = usePathname();

  if (!pathname || pathname === "/staff" || pathname.startsWith("/staff/")) {
    return null;
  }

  return (
    <>
      <AdRail side="left" />
      <AdRail side="right" />
    </>
  );
}
