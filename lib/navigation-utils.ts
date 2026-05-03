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

  if (isAuthenticated && isAdmin) {
    items.push({ href: "/admin", label: "관리자" });
  }

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
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return null;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isAuthenticated || !isAdmin) {
      return `/admin/login?error=${encodeURIComponent("관리자 로그인 후 접근해 주세요.")}`;
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
