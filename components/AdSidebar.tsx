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

/**
 * 일반 사용자 페이지(거래소/메인/마이페이지 등) 우측에 노출되는 광고 영역 placeholder.
 *
 * - /staff/* (관리자 콘솔)에서는 렌더하지 않음
 * - viewport 1500px 미만에서는 CSS로 hide (광고 폭 + 메인 container 1200px 합산 후 여유 영역)
 * - 실제 광고 SDK 통합 전 미리보기를 위한 hatched 패턴 placeholder
 */
export function AdSidebar() {
  const pathname = usePathname();

  if (!pathname || pathname === "/staff" || pathname.startsWith("/staff/")) {
    return null;
  }

  return (
    <aside aria-label="광고 영역 (실제 광고 통합 전 placeholder)" className="ad-sidebar">
      <p className="ad-sidebar__heading">SPONSORED · 광고 영역 미리보기</p>
      {SLOTS.map((slot) => (
        <div
          aria-hidden="true"
          className="ad-sidebar__slot"
          key={`${slot.size}-${slot.label}`}
          style={{ height: `${slot.height}px`, width: `${slot.width}px` }}
          title={slot.hint}
        >
          <span className="ad-sidebar__slot-tag">광고</span>
          <strong>{slot.label}</strong>
          <span className="ad-sidebar__slot-size">{slot.size}</span>
          {slot.hint ? <span className="ad-sidebar__slot-note">{slot.hint}</span> : null}
        </div>
      ))}
      <p className="ad-sidebar__footer">
        실제 광고 통합 전 placeholder입니다.
      </p>
    </aside>
  );
}
