import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Restrict middleware to protected routes only — public pages (`/`, `/market`,
// `/guide`, etc.) skip the supabase session lookup entirely.
export const config = {
  matcher: [
    "/staff/:path*",
    "/mypage/:path*",
    "/sell",
    "/buy",
    "/market/:id/edit"
  ]
};
