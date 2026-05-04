import { createClient } from "./supabase/server";
import type { TrustSignal } from "./types";

interface TradeStatsRow {
  comment_count: number | string;
  closed_posts: number | string;
  joined_at: string;
  profile_id: string;
  total_posts: number | string;
}

export async function getTrustSignalsByIds(profileIds: string[]): Promise<Record<string, TrustSignal>> {
  if (!profileIds.length) {
    return {};
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_trade_stats")
    .select("profile_id, joined_at, total_posts, closed_posts, comment_count")
    .in("profile_id", profileIds);

  if (error || !data) {
    return {};
  }

  return (data as TradeStatsRow[]).reduce<Record<string, TrustSignal>>((accumulator, row) => {
    accumulator[row.profile_id] = {
      closedPosts: Number(row.closed_posts ?? 0),
      commentCount: Number(row.comment_count ?? 0),
      joinedAtIso: row.joined_at,
      profileId: row.profile_id,
      totalPosts: Number(row.total_posts ?? 0)
    };
    return accumulator;
  }, {});
}

export async function getTrustSignal(profileId: string | null | undefined): Promise<TrustSignal | null> {
  if (!profileId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_trade_stats")
    .select("profile_id, joined_at, total_posts, closed_posts, comment_count")
    .eq("profile_id", profileId)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as TradeStatsRow;
  return {
    closedPosts: Number(row.closed_posts ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    joinedAtIso: row.joined_at,
    profileId: row.profile_id,
    totalPosts: Number(row.total_posts ?? 0)
  };
}
