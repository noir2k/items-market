import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes is intentionally disabled — many of our redirects build query
  // strings dynamically (e.g. `/market/${id}?error=...`) which the typedRoutes
  // checker rejects without per-call `as Route` casts. We rely on `tsc --strict`
  // for type safety instead.
  typedRoutes: false
};

export default nextConfig;
