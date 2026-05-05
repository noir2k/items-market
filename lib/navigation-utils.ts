import { sanitizeRedirectPath } from "./auth-utils";

export interface NavItem {
  href: string;
  label: string;
}

export function getHeaderNavItems({
  isAdmin,
  isAuthenticated
}: {
  isAdmin: boolean;
  isAuthenticated: boolean;
}): NavItem[] {
  const items: NavItem[] = [
    { href: "/market", label: "거래소" },
    { href: "/sell", label: "판매등록" },
    { href: "/buy", label: "구매등록" }
  ];

  if (isAuthenticated) {
    items.push({ href: "/mypage", label: "마이페이지" });
  }

  // 관리자 콘솔(/staff/*)은 일반 사이트 nav에 노출하지 않음 — 숨겨진 라우트로 별도 진입.
  // 관리자 권한 사용자가 /staff URL을 직접 입력하면 staff 콘솔 헤더로 진입한다.

  items.push({ href: "/guide", label: "이용안내" });

  return items;
}

export function getAuthHiddenFields({
  mode,
  nextPath
}: {
  mode: "admin" | "member";
  nextPath?: string | null;
}): Array<{ name: string; value: string }> {
  const fields: Array<{ name: string; value: string }> = [{ name: "mode", value: mode }];
  const safeNextPath = sanitizeRedirectPath(nextPath);

  if (safeNextPath) {
    fields.push({ name: "next", value: safeNextPath });
  }

  return fields;
}

export function getProtectedRouteRedirect({
  isAdmin,
  isAuthenticated,
  pathname
}: {
  isAdmin: boolean;
  isAuthenticated: boolean;
  pathname: string;
}): string | null {
  if (pathname === "/staff/login" || pathname.startsWith("/staff/login/")) {
    return null;
  }

  if (pathname === "/staff" || pathname.startsWith("/staff/")) {
    if (!isAuthenticated || !isAdmin) {
      return `/staff/login?error=${encodeURIComponent("관리자 로그인 후 접근해 주세요.")}`;
    }

    return null;
  }

  const requiresAuthentication =
    pathname === "/mypage" ||
    pathname.startsWith("/mypage/") ||
    pathname === "/sell" ||
    pathname === "/buy" ||
    (pathname.startsWith("/market/") && pathname.endsWith("/edit"));

  if (requiresAuthentication && !isAuthenticated) {
    return `/login?next=${encodeURIComponent(pathname)}`;
  }

  return null;
}
