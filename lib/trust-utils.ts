import type { AppRole, TrustBadgeKind } from "./types";

const NEWCOMER_DAYS = 7;
const ACTIVE_TRADES = 10;

export function getMembershipDays(joinedAtIso: string, now: Date = new Date()): number {
  const joined = new Date(joinedAtIso);
  if (Number.isNaN(joined.getTime())) {
    return 0;
  }
  const diffMs = now.getTime() - joined.getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
}

export function getMembershipLabel(joinedAtIso: string, now: Date = new Date()): string {
  const days = getMembershipDays(joinedAtIso, now);
  if (days < 1) {
    return "오늘 가입";
  }
  if (days < 30) {
    return `가입 ${days}일 전`;
  }
  if (days < 365) {
    return `가입 ${Math.floor(days / 30)}개월 전`;
  }
  return `가입 ${Math.floor(days / 365)}년 전`;
}

export function getSuccessRate(totalPosts: number, closedPosts: number): number {
  if (totalPosts <= 0) {
    return 0;
  }
  return Math.round((closedPosts / totalPosts) * 100);
}

export function getActivityLabel(recentPosts: number, recentComments: number): string {
  const total = recentPosts + recentComments;
  if (total === 0) {
    return "최근 활동 없음";
  }
  if (total < 3) {
    return `최근 30일 ${total}회 활동`;
  }
  if (total < 10) {
    return `최근 30일 ${total}회 활동 (활발)`;
  }
  return `최근 30일 ${total}회 활동 (매우 활발)`;
}

export function getTrustBadge({
  joinedAtIso,
  now = new Date(),
  role,
  totalPosts
}: {
  joinedAtIso: string;
  now?: Date;
  role: AppRole;
  totalPosts: number;
}): { kind: TrustBadgeKind; label: string } {
  if (role === "admin") {
    return { kind: "admin", label: "관리자 인증" };
  }

  const days = getMembershipDays(joinedAtIso, now);
  if (days < NEWCOMER_DAYS) {
    return { kind: "newcomer", label: "신규 회원" };
  }

  if (totalPosts >= ACTIVE_TRADES) {
    return { kind: "active", label: "활발한 거래자" };
  }

  return { kind: "regular", label: "일반 회원" };
}
