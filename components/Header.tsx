import { isAdminProfile } from "../lib/auth-utils";
import { getHeaderNavItems } from "../lib/navigation-utils";
import { getCurrentProfile } from "../lib/supabase/server";
import { signOutAction } from "../app/auth/actions";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const { profile, user } = await getCurrentProfile();
  const isAuthenticated = Boolean(user && profile);
  const isAdmin = isAdminProfile(profile);

  return (
    <HeaderClient
      isAdmin={isAdmin}
      isAuthenticated={isAuthenticated}
      navItems={getHeaderNavItems({ isAdmin, isAuthenticated })}
      profileNickname={profile?.nickname || null}
      signOutAction={signOutAction}
    />
  );
}
