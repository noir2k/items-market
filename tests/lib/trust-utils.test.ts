import { describe, expect, it } from "vitest";
import {
  getActivityLabel,
  getMembershipDays,
  getMembershipLabel,
  getSuccessRate,
  getTrustBadge
} from "../../lib/trust-utils";

describe("getMembershipDays", () => {
  const now = new Date("2026-05-10T00:00:00Z");

  it("counts whole days since the given timestamp", () => {
    expect(getMembershipDays("2026-05-08T00:00:00Z", now)).toBe(2);
  });

  it("returns 0 for same-day or future dates", () => {
    expect(getMembershipDays("2026-05-10T05:00:00Z", now)).toBe(0);
    expect(getMembershipDays("2030-01-01T00:00:00Z", now)).toBe(0);
  });

  it("returns 0 for invalid input", () => {
    expect(getMembershipDays("not-a-date", now)).toBe(0);
  });
});

describe("getMembershipLabel", () => {
  const now = new Date("2026-05-10T00:00:00Z");

  it("uses Korean labels at appropriate granularities", () => {
    expect(getMembershipLabel("2026-05-09T23:00:00Z", now)).toBe("오늘 가입");
    expect(getMembershipLabel("2026-05-05T00:00:00Z", now)).toBe("가입 5일 전");
    expect(getMembershipLabel("2026-03-01T00:00:00Z", now)).toBe("가입 2개월 전");
    expect(getMembershipLabel("2024-05-01T00:00:00Z", now)).toBe("가입 2년 전");
  });
});

describe("getSuccessRate", () => {
  it("returns rounded percentage of closed posts", () => {
    expect(getSuccessRate(0, 0)).toBe(0);
    expect(getSuccessRate(10, 7)).toBe(70);
    expect(getSuccessRate(3, 1)).toBe(33);
  });
});

describe("getActivityLabel", () => {
  it("describes recent activity in Korean", () => {
    expect(getActivityLabel(0, 0)).toBe("최근 활동 없음");
    expect(getActivityLabel(1, 0)).toBe("최근 30일 1회 활동");
    expect(getActivityLabel(3, 2)).toBe("최근 30일 5회 활동 (활발)");
    expect(getActivityLabel(15, 0)).toBe("최근 30일 15회 활동 (매우 활발)");
  });
});

describe("getTrustBadge", () => {
  const now = new Date("2026-05-10T00:00:00Z");

  it("returns admin badge for admin role regardless of stats", () => {
    expect(
      getTrustBadge({ joinedAtIso: "2024-01-01", now, role: "admin", totalPosts: 0 }).kind
    ).toBe("admin");
  });

  it("returns newcomer when joined within 7 days", () => {
    expect(
      getTrustBadge({ joinedAtIso: "2026-05-05T00:00:00Z", now, role: "member", totalPosts: 0 }).kind
    ).toBe("newcomer");
  });

  it("returns active when totalPosts >= 10", () => {
    expect(
      getTrustBadge({ joinedAtIso: "2024-01-01", now, role: "member", totalPosts: 12 }).kind
    ).toBe("active");
  });

  it("falls back to regular member", () => {
    expect(
      getTrustBadge({ joinedAtIso: "2024-01-01", now, role: "member", totalPosts: 3 }).kind
    ).toBe("regular");
  });
});
