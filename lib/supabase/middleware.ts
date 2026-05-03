import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminProfile } from "../auth-utils";
import { getProtectedRouteRedirect } from "../navigation-utils";
import type { Profile } from "../types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    profile = (data as Profile | null) ?? null;
  }

  const redirectPath = getProtectedRouteRedirect({
    isAdmin: isAdminProfile(profile),
    isAuthenticated: Boolean(user && profile),
    pathname: request.nextUrl.pathname
  });

  if (redirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath.split("?")[0];
    redirectUrl.search = redirectPath.includes("?") ? `?${redirectPath.split("?")[1]}` : "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
