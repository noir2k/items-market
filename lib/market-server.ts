import type { MarketCategoryCode, MarketGameOption, MarketPost, MarketPostRecord, MarketStatus, TradeType } from "./types";
import { mapMarketPostRecord } from "./market-utils";
import { createClient } from "./supabase/server";

const MARKET_POST_LIST_SELECT = `
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
  game:games(id, slug, name),
  profile:profiles!market_posts_author_id_fkey(nickname, role),
  market_comments(id)
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

function normalizeRecordShape(record: any): MarketPostRecord {
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

export async function listFeaturedMarketPosts(limit = 3): Promise<MarketPost[]> {
  return runPostQuery(MARKET_POST_LIST_SELECT, {
    limit,
    onlyOpen: true
  });
}

export async function getMarketPostById(id: string): Promise<MarketPost | null> {
  const posts = await runPostQuery(MARKET_POST_DETAIL_SELECT, { postId: id });
  return posts[0] ?? null;
}

export async function listPostsByAuthor(authorId: string): Promise<MarketPost[]> {
  return runPostQuery(MARKET_POST_LIST_SELECT, { authorId });
}

export async function listMarketGameOptions(): Promise<MarketGameOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MarketGameOption[];
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
