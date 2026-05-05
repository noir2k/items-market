import type { GameBoardStat, GameGenre, MarketCategoryCode, MarketGameOption, MarketPost, MarketPostRecord, MarketStatus, TradeType } from "./types";
import { mapMarketPostRecord } from "./market-utils";
import { createClient } from "./supabase/server";

export const MARKET_POST_LIST_SELECT = `
  id,
  author_id,
  trade_type,
  category,
  status,
  title,
  content,
  server_name,
  price,
  price_label,
  quantity_description,
  view_count,
  created_at,
  updated_at,
  closed_at,
  game:games(id, slug, name, genre),
  profile:profiles!market_posts_author_id_fkey(nickname, role),
  market_comments(id, created_at)
`;


const MARKET_POST_DETAIL_SELECT = `
  id,
  author_id,
  trade_type,
  category,
  status,
  title,
  content,
  server_name,
  price,
  price_label,
  quantity_description,
  view_count,
  created_at,
  updated_at,
  closed_at,
  game:games(id, slug, name),
  profile:profiles!market_posts_author_id_fkey(nickname, role),
  market_comments(
    id,
    comment_type,
    content,
    created_at,
    author:profiles!market_comments_author_id_fkey(nickname)
  )
`;

export interface MarketPostFormValues {
  authorId: string;
  category: MarketCategoryCode;
  content: string;
  gameId: string;
  id: string;
  priceLabel: string;
  quantityDescription: string;
  serverName: string;
  status: MarketStatus;
  title: string;
  tradeType: TradeType;
}

function ensureSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function normalizeRecordShape(record: any): MarketPostRecord {
  const comments = Array.isArray(record.market_comments)
    ? record.market_comments.map((comment: any) => ({
        ...comment,
        author: ensureSingle(comment.author)
      }))
    : [];

  return {
    ...record,
    game: ensureSingle(record.game),
    market_comments: comments,
    profile: ensureSingle(record.profile)
  } as MarketPostRecord;
}

function parsePostId(id: string): number | null {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
}

async function runPostQuery(selectClause: string, options?: {
  authorId?: string;
  limit?: number;
  onlyOpen?: boolean;
  postId?: string;
}): Promise<MarketPost[]> {
  const supabase = await createClient();
  let query = supabase.from("market_posts").select(selectClause).order("created_at", { ascending: false });

  if (options?.onlyOpen) {
    query = query.eq("status", "open");
  }

  if (options?.authorId) {
    query = query.eq("author_id", options.authorId);
  }

  if (options?.postId) {
    const numericId = parsePostId(options.postId);

    if (!numericId) {
      return [];
    }

    query = query.eq("id", numericId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as any[]).map((record) => mapMarketPostRecord(normalizeRecordShape(record)));
}

export async function listMarketPosts(): Promise<MarketPost[]> {
  return runPostQuery(MARKET_POST_LIST_SELECT);
}

export async function listMarketPostsByGameSlug(slug: string): Promise<MarketPost[]> {
  const supabase = await createClient();
  const { data: gameRow, error: gameError } = await supabase
    .from("games")
    .select("id")
    .eq("slug", slug)
    .single();

  if (gameError || !gameRow) {
    return [];
  }

  const gameId = (gameRow as { id: number }).id;
  const { data, error } = await supabase
    .from("market_posts")
    .select(MARKET_POST_LIST_SELECT)
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return ((data ?? []) as any[]).map((record) => mapMarketPostRecord(normalizeRecordShape(record)));
}

export async function listFeaturedMarketPosts(limit = 3): Promise<MarketPost[]> {
  return runPostQuery(MARKET_POST_LIST_SELECT, {
    limit,
    onlyOpen: true
  });
}

export async function getMarketPostById(id: string): Promise<MarketPost | null> {
  const numericId = parsePostId(id);

  if (!numericId) {
    return null;
  }

  const posts = await runPostQuery(MARKET_POST_DETAIL_SELECT, { postId: id });
  const post = posts[0] ?? null;

  if (post) {
    const supabase = await createClient();
    await supabase.rpc("increment_market_post_view", { p_post_id: numericId });
  }

  return post;
}

export async function listPostsByAuthor(authorId: string): Promise<MarketPost[]> {
  return runPostQuery(MARKET_POST_LIST_SELECT, { authorId });
}

interface GameRow {
  id: number;
  name: string;
  slug: string;
  genre: GameGenre | null;
  icon_path: string | null;
}

function mapGameRow(row: GameRow): MarketGameOption {
  return {
    genre: row.genre ?? "other",
    iconPath: row.icon_path,
    id: row.id,
    name: row.name,
    slug: row.slug
  };
}

export async function listGameBoardStats(): Promise<GameBoardStat[]> {
  const supabase = await createClient();
  const [gamesResult, postsResult] = await Promise.all([
    supabase
      .from("games")
      .select("id, slug, name, genre, icon_path")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("market_posts").select("game_id, status, trade_type")
  ]);

  if (gamesResult.error || postsResult.error) {
    return [];
  }

  const games = ((gamesResult.data ?? []) as GameRow[]).map(mapGameRow);
  const posts = (postsResult.data ?? []) as Array<{
    game_id: number;
    status: MarketStatus;
    trade_type: TradeType;
  }>;

  return games.map((game) => {
    const gamePosts = posts.filter((post) => post.game_id === game.id);
    return {
      buyPosts: gamePosts.filter((post) => post.trade_type === "buy").length,
      game,
      openPosts: gamePosts.filter((post) => post.status === "open").length,
      sellPosts: gamePosts.filter((post) => post.trade_type === "sell").length,
      totalPosts: gamePosts.length
    };
  });
}

export async function listMarketGameOptions(): Promise<MarketGameOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, name, genre, icon_path")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as GameRow[]).map(mapGameRow);
}

export async function getMarketStats(): Promise<{
  closedTodayCount: number;
  openCount: number;
  totalCount: number;
}> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [openResult, totalResult, closedResult] = await Promise.all([
    supabase.from("market_posts").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("market_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("market_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "closed")
      .gte("closed_at", startOfDay.toISOString())
  ]);

  return {
    closedTodayCount: closedResult.count ?? 0,
    openCount: openResult.count ?? 0,
    totalCount: totalResult.count ?? 0
  };
}

export async function getMarketPostFormValues(id: string): Promise<MarketPostFormValues | null> {
  const numericId = parsePostId(id);

  if (!numericId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_posts")
    .select("id, author_id, game_id, trade_type, category, status, title, content, server_name, price_label, quantity_description")
    .eq("id", numericId)
    .single();

  if (error) {
    return null;
  }

  return {
    authorId: data.author_id,
    category: data.category,
    content: data.content,
    gameId: String(data.game_id),
    id: String(data.id),
    priceLabel: data.price_label,
    quantityDescription: data.quantity_description,
    serverName: data.server_name,
    status: data.status,
    title: data.title,
    tradeType: data.trade_type
  };
}
