export type AppRole = "admin" | "member";
export type MemberStatus = "active" | "suspended";
export type MarketCategoryCode = "game_money" | "item" | "account" | "etc";
export type MarketCommentType = "inquiry" | "offer" | "system";

export interface Profile {
  id?: string;
  email?: string;
  nickname?: string;
  role: AppRole;
  status: MemberStatus;
}

export type TradeType = "buy" | "sell";
export type MarketStatus = "open" | "closed";

export interface MarketComment {
  id: string;
  author?: string;
  createdAt?: string;
  label?: string;
  message?: string;
}

export interface MarketPost {
  id: string;
  tradeType: TradeType;
  status: MarketStatus;
  category: string;
  game: string;
  gameSlug?: string;
  authorId?: string;
  authorName?: string;
  authorRoleLabel?: string;
  server?: string;
  title?: string;
  content?: string;
  price?: string;
  quantity?: string;
  updatedAt?: string;
  createdAt?: string;
  updatedAtIso?: string;
  createdAtIso?: string;
  views?: number;
  summary?: string;
  badges?: string[];
  comments: MarketComment[];
  commentCount: number;
  canManage?: boolean;
}

export interface TrustSignal {
  profileId: string;
  joinedAtIso: string;
  totalPosts: number;
  closedPosts: number;
  commentCount: number;
  recentPosts30d: number;
  recentComments30d: number;
}

export type TrustBadgeKind = "newcomer" | "regular" | "active" | "admin";

export interface AdminMemberProfile {
  created_at?: string;
  email?: string;
  id: string;
  nickname?: string;
  role?: AppRole;
  status: MemberStatus;
}

export interface MarketGameOption {
  id: number;
  name: string;
  slug: string;
}

export interface MarketCommentRecord {
  id: number | string;
  author?: {
    nickname: string | null;
  } | null;
  comment_type: MarketCommentType;
  content: string;
  created_at: string;
}

export interface MarketPostRecord {
  id: number | string;
  author_id: string;
  category: MarketCategoryCode;
  content: string;
  created_at: string;
  game?: MarketGameOption | null;
  market_comments?: MarketCommentRecord[];
  price: number | null;
  price_label: string;
  profile?: {
    nickname: string | null;
    role: AppRole;
  } | null;
  quantity_description: string;
  server_name: string;
  status: MarketStatus;
  title: string;
  trade_type: TradeType;
  updated_at: string;
  view_count: number;
}
