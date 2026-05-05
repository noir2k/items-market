import { isAdminProfile } from "../lib/auth-utils";
import { getCurrentProfile } from "../lib/supabase/server";
import { signOutAction } from "../app/auth/actions";
import { AdminHeaderClient, type AdminNavItem } from "./AdminHeaderClient";

const STAFF_NAV_ITEMS: AdminNavItem[] = [
  { href: "/staff", label: "대시보드" },
  { href: "/staff/members", label: "회원 관리" },
  { href: "/staff/posts", label: "게시물 관리" },
  { href: "/staff/games", label: "게시판 관리" }
];

export async function AdminHeader() {
  const { profile, user } = await getCurrentProfile();
  const isAuthenticated = Boolean(user && profile && isAdminProfile(profile));

  return (
    <AdminHeaderClient
      isAuthenticated={isAuthenticated}
      navItems={STAFF_NAV_ITEMS}
      profileNickname={profile?.nickname || null}
      signOutAction={signOutAction}
    />
  );
}
