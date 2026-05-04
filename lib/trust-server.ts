import { createClient } from "./supabase/server";
import type { TrustSignal } from "./types";

interface TradeStatsRow {
  closed_posts: number | string;
  comment_count: number | string;
  joined_at: string;
  profile_id: string;
  recent_comments_30d: number | string;
  recent_posts_30d: number | string;
  total_posts: number | string;
}

const SELECT_FIELDS = "profile_id, joined_at, total_posts, closed_posts, comment_count, recent_posts_30d, recent_comments_30d";

function mapRow(row: TradeStatsRow): TrustSignal {
  return {
    closedPosts: Number(row.closed_posts ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    joinedAtIso: row.joined_at,
    profileId: row.profile_id,
    recentComments30d: Number(row.recent_comments_30d ?? 0),
    recentPosts30d: Number(row.recent_posts_30d ?? 0),
    totalPosts: Number(row.total_posts ?? 0)
  };
}

export async function getTrustSignalsByIds(profileIds: string[]): Promise<Record<string, TrustSignal>> {
  if (!profileIds.length) {
    return {};
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_trade_stats")
    .select(SELECT_FIELDS)
    .in("profile_id", profileIds);

  if (error || !data) {
    return {};
  }

  return (data as TradeStatsRow[]).reduce<Record<string, TrustSignal>>((accumulator, row) => {
    accumulator[row.profile_id] = mapRow(row);
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
    .select(SELECT_FIELDS)
    .eq("profile_id", profileId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapRow(data as TradeStatsRow);
}
