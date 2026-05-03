import { filterPostsByMonth, getAdminSummary, getMonthOptions } from "./admin-utils";
import { listMarketPosts, listPostsByAuthor } from "./market-server";
import { isAdminProfile } from "./auth-utils";
import { createClient, getCurrentProfile } from "./supabase/server";
import type { AdminMemberProfile, MarketPost } from "./types";

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
