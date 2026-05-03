import { describe, expect, it } from "vitest";
import {
  getMemberStatusLabel,
  getPostLoginPath,
  getRoleLabel,
  isAdminProfile,
  sanitizeRedirectPath
} from "../../lib/auth-utils";

describe("isAdminProfile", () => {
  it("returns true only for active admin profiles", () => {
    expect(isAdminProfile({ role: "admin", status: "active" })).toBe(true);
    expect(isAdminProfile({ role: "member", status: "active" })).toBe(false);
    expect(isAdminProfile({ role: "admin", status: "suspended" })).toBe(false);
    expect(isAdminProfile(null)).toBe(false);
  });
});

describe("sanitizeRedirectPath", () => {
  it("allows only local app paths", () => {
    expect(sanitizeRedirectPath("/market?tab=sell")).toBe("/market?tab=sell");
    expect(sanitizeRedirectPath("https://evil.example")).toBe(null);
    expect(sanitizeRedirectPath("//evil.example")).toBe(null);
    expect(sanitizeRedirectPath("market")).toBe(null);
  });
});

describe("getRoleLabel", () => {
  it("localizes role codes", () => {
    expect(getRoleLabel("admin")).toBe("관리자");
    expect(getRoleLabel("member")).toBe("일반회원");
    expect(getRoleLabel(undefined)).toBe("일반회원");
  });
});

describe("getMemberStatusLabel", () => {
  it("localizes status codes", () => {
    expect(getMemberStatusLabel("active")).toBe("활성");
    expect(getMemberStatusLabel("suspended")).toBe("정지");
    expect(getMemberStatusLabel(undefined)).toBe("활성");
  });
});

describe("getPostLoginPath", () => {
  it("prioritizes admin dashboard for admin login", () => {
    expect(getPostLoginPath({ isAdminLogin: true, nextPath: "/market", profile: { role: "admin", status: "active" } })).toBe("/admin");
  });

  it("uses safe next path when present", () => {
    expect(getPostLoginPath({ isAdminLogin: false, nextPath: "/mypage", profile: { role: "member", status: "active" } })).toBe("/mypage");
  });

  it("falls back to market for regular users", () => {
    expect(getPostLoginPath({ isAdminLogin: false, nextPath: null, profile: { role: "member", status: "active" } })).toBe("/market");
  });
});
