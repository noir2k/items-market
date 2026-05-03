import type { Profile } from "./types";

export function isAdminProfile(profile: Profile | null | undefined): boolean {
  return Boolean(profile && profile.role === "admin" && profile.status === "active");
}

export function sanitizeRedirectPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") {
    return null;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
}

interface PostLoginPathArgs {
  isAdminLogin?: boolean;
  nextPath?: string | null;
  profile?: Profile | null;
}

export function getPostLoginPath({
  isAdminLogin = false,
  nextPath = null,
  profile = null
}: PostLoginPathArgs): string {
  if (isAdminLogin && isAdminProfile(profile)) {
    return "/admin";
  }

  const safeNextPath = sanitizeRedirectPath(nextPath);

  if (safeNextPath) {
    return safeNextPath;
  }

  return "/market";
}
