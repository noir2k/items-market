import { filterPostsByMonth, getAdminSummary, getMonthOptions } from "./admin-utils";
import { listMarketPosts, listPostsByAuthor } from "./market-server";
import { isAdminProfile } from "./auth-utils";
import { createClient, getCurrentProfile } from "./supabase/server";
import type { AdminMemberProfile, GameGenre, MarketPost } from "./types";

export interface AdminGameRow {
  id: number;
  slug: string;
  name: string;
  genre: GameGenre | null;
  iconPath: string | null;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
  openPostCount: number;
}

export interface AdminMemberWithStats extends AdminMemberProfile {
  closedPostCount: number;
  openPostCount: number;
  postCount: number;
}

export async function requireAdminAccess() {
  const supabase = await createClient();
  const { profile, user } = await getCurrentProfile();

  if (!user || !isAdminProfile(profile)) {
    return null;
  }

  return {
    profile,
    supabase,
    user
  };
}

export async function listAdminMembers(): Promise<AdminMemberProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminMemberProfile[];
}

export async function getAdminMemberById(memberId: string): Promise<AdminMemberProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, status, created_at")
    .eq("id", memberId)
    .single();

  if (error) {
    return null;
  }

  return data as AdminMemberProfile;
}

export async function getAdminDashboardData({
  memberId,
  month
}: {
  memberId?: string | null;
  month?: string | null;
}) {
  const [members, posts] = await Promise.all([listAdminMembers(), listMarketPosts()]);
  const statsByMemberId = posts.reduce<Record<string, { closedPostCount: number; openPostCount: number; postCount: number }>>(
    (accumulator, post) => {
      const key = post.authorId || "unknown";
      const current = accumulator[key] || {
        closedPostCount: 0,
        openPostCount: 0,
        postCount: 0
      };

      current.postCount += 1;
      current.openPostCount += post.status === "open" ? 1 : 0;
      current.closedPostCount += post.status === "closed" ? 1 : 0;
      accumulator[key] = current;
      return accumulator;
    },
    {}
  );

  const membersWithStats: AdminMemberWithStats[] = members.map((member) => ({
    ...member,
    ...(statsByMemberId[member.id] || {
      closedPostCount: 0,
      openPostCount: 0,
      postCount: 0
    })
  }));

  const summary = getAdminSummary({
    members,
    posts
  });

  let selectedMember: AdminMemberProfile | null = null;
  let selectedMemberPosts: MarketPost[] = [];

  if (memberId) {
    [selectedMember, selectedMemberPosts] = await Promise.all([
      getAdminMemberById(memberId),
      listPostsByAuthor(memberId)
    ]);
  }

  const selectedMemberMonthOptions = getMonthOptions(selectedMemberPosts);
  const filteredSelectedMemberPosts = filterPostsByMonth(selectedMemberPosts, month);

  return {
    members: membersWithStats,
    monthOptions: selectedMemberMonthOptions,
    posts,
    selectedMember,
    selectedMemberPosts: filteredSelectedMemberPosts,
    summary
  };
}

interface RawAdminGameRow {
  id: number;
  slug: string;
  name: string;
  genre: GameGenre | null;
  icon_path: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AdminPostFilter {
  gameSlug?: string | null;
  genre?: GameGenre | null;
  status?: "open" | "closed" | "all" | null;
}

export function filterAdminPosts(posts: MarketPost[], filter: AdminPostFilter, gamesBySlug: Record<string, AdminGameRow>): MarketPost[] {
  return posts.filter((post) => {
    if (filter.gameSlug && filter.gameSlug !== "all") {
      if (post.gameSlug !== filter.gameSlug) return false;
    }
    if (filter.genre && filter.genre !== ("all" as GameGenre)) {
      const game = post.gameSlug ? gamesBySlug[post.gameSlug] : undefined;
      if (!game || game.genre !== filter.genre) return false;
    }
    if (filter.status && filter.status !== "all") {
      if (post.status !== filter.status) return false;
    }
    return true;
  });
}

export async function listAdminGames(): Promise<AdminGameRow[]> {
  const supabase = await createClient();

  const [gamesResult, postsResult] = await Promise.all([
    supabase
      .from("games")
      .select("id, slug, name, genre, icon_path, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase.from("market_posts").select("game_id, status")
  ]);

  if (gamesResult.error) {
    throw new Error(gamesResult.error.message);
  }

  if (postsResult.error) {
    throw new Error(postsResult.error.message);
  }

  const posts = (postsResult.data ?? []) as Array<{ game_id: number; status: string }>;
  const games = (gamesResult.data ?? []) as RawAdminGameRow[];

  return games.map((game) => {
    const gamePosts = posts.filter((post) => post.game_id === game.id);
    return {
      genre: game.genre,
      iconPath: game.icon_path,
      id: game.id,
      isActive: game.is_active,
      name: game.name,
      openPostCount: gamePosts.filter((post) => post.status === "open").length,
      postCount: gamePosts.length,
      slug: game.slug,
      sortOrder: game.sort_order
    };
  });
}
