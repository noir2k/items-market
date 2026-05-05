import { describe, expect, it } from "vitest";
import { getAuthHiddenFields, getHeaderNavItems, getProtectedRouteRedirect } from "../../lib/navigation-utils";

describe("getHeaderNavItems", () => {
  it("does not expose private pages to anonymous users", () => {
    expect(getHeaderNavItems({ isAdmin: false, isAuthenticated: false }).map((item) => item.href)).toEqual([
      "/market",
      "/sell",
      "/buy",
      "/guide"
    ]);
  });

  it("exposes mypage to signed-in members but never advertises the staff console in the public nav", () => {
    expect(getHeaderNavItems({ isAdmin: false, isAuthenticated: true }).map((item) => item.href)).toContain("/mypage");
    // /staff is a hidden console; even admin sessions must not see it in the public nav.
    expect(getHeaderNavItems({ isAdmin: true, isAuthenticated: true }).map((item) => item.href)).not.toContain("/staff");
    expect(getHeaderNavItems({ isAdmin: true, isAuthenticated: true }).map((item) => item.href)).not.toContain("/admin");
  });
});

describe("getAuthHiddenFields", () => {
  it("preserves a safe next path for login forms", () => {
    expect(getAuthHiddenFields({ mode: "member", nextPath: "/mypage" })).toEqual([
      { name: "mode", value: "member" },
      { name: "next", value: "/mypage" }
    ]);
  });

  it("drops unsafe next paths", () => {
    expect(getAuthHiddenFields({ mode: "member", nextPath: "https://evil.example" })).toEqual([
      { name: "mode", value: "member" }
    ]);
  });
});

describe("getProtectedRouteRedirect", () => {
  it("redirects anonymous users away from private pages with the original path preserved", () => {
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: false, pathname: "/mypage" })).toBe(
      "/login?next=%2Fmypage"
    );
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: false, pathname: "/market/12/edit" })).toBe(
      "/login?next=%2Fmarket%2F12%2Fedit"
    );
  });

  it("redirects non-admin users away from staff console pages", () => {
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: true, pathname: "/staff" })).toBe(
      "/staff/login?error=%EA%B4%80%EB%A6%AC%EC%9E%90%20%EB%A1%9C%EA%B7%B8%EC%9D%B8%20%ED%9B%84%20%EC%A0%91%EA%B7%BC%ED%95%B4%20%EC%A3%BC%EC%84%B8%EC%9A%94."
    );
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: true, pathname: "/staff/members" })).toBe(
      "/staff/login?error=%EA%B4%80%EB%A6%AC%EC%9E%90%20%EB%A1%9C%EA%B7%B8%EC%9D%B8%20%ED%9B%84%20%EC%A0%91%EA%B7%BC%ED%95%B4%20%EC%A3%BC%EC%84%B8%EC%9A%94."
    );
  });

  it("allows public pages and staff login", () => {
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: false, pathname: "/market" })).toBe(null);
    expect(getProtectedRouteRedirect({ isAdmin: false, isAuthenticated: false, pathname: "/staff/login" })).toBe(null);
  });
});
