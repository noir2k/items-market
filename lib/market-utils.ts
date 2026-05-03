import type {
  AppRole,
  MarketCategoryCode,
  MarketComment,
  MarketCommentRecord,
  MarketPost,
  MarketPostRecord,
  MarketStatus,
  TradeType
} from "./types";

export const marketCategoryOptions = [
  { code: "all", label: "전체" },
  { code: "game_money", label: "게임머니" },
  { code: "item", label: "아이템" },
  { code: "account", label: "계정" },
  { code: "etc", label: "기타" }
] as const;

export type MarketCategoryFilterCode = (typeof marketCategoryOptions)[number]["code"];

/** @deprecated use marketCategoryOptions instead — retained for legacy callers */
export const marketCategories = marketCategoryOptions.map((option) => option.label);

const categoryLabelMap: Record<MarketCategoryCode, string> = {
  account: "계정",
  etc: "기타",
  game_money: "게임머니",
  item: "아이템"
};

const categoryCodeMap: Record<string, MarketCategoryCode> = {
  game_money: "game_money",
  account: "account",
  item: "item",
  etc: "etc",
  "게임머니": "game_money",
  "계정": "account",
  "아이템": "item",
  "기타": "etc"
};

function formatRelativeTime(dateText: string, now: Date = new Date()): string {
  const date = new Date(dateText);
  const diffMs = now.getTime() - date.getTime();

  if (Number.isNaN(date.getTime()) || diffMs < 0) {
    return dateText;
  }

  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).format(date);
}

function formatRoleLabel(role: AppRole | null | undefined): string {
  return role === "admin" ? "관리자" : "일반회원";
}

function buildSummary(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 88) {
    return normalized;
  }

  return `${normalized.slice(0, 87)}…`;
}

export function getTradeTypeLabel(tradeType: TradeType): string {
  return tradeType === "buy" ? "삽니다" : "팝니다";
}

export function getStatusLabel(status: MarketStatus): string {
  return status === "closed" ? "거래완료" : "거래중";
}

export function getCategoryLabel(category: MarketCategoryCode): string {
  return categoryLabelMap[category];
}

export function getCategoryCode(category: string): MarketCategoryCode {
  return categoryCodeMap[category] ?? "etc";
}

export function getCommentTypeLabel(
  commentType: MarketCommentRecord["comment_type"] | undefined,
  tradeType: TradeType
): string {
  if (commentType === "system") {
    return "관리자 안내";
  }

  if (commentType === "offer") {
    return "판매제안";
  }

  return tradeType === "sell" ? "구매문의" : "거래문의";
}

export function normalizePriceInput(value: string): { price: number | null; priceLabel: string } {
  const trimmed = value.trim();
  const numeric = Number(trimmed.replace(/[^\d]/g, ""));

  if (!trimmed || Number.isNaN(numeric) || numeric <= 0) {
    return {
      price: null,
      priceLabel: trimmed || "협의"
    };
  }

  return {
    price: numeric,
    priceLabel: `${new Intl.NumberFormat("ko-KR").format(numeric)}원`
  };
}

export function canManageMarketPost({
  authorId,
  isAdmin,
  viewerId
}: {
  authorId: string;
  isAdmin: boolean;
  viewerId: string | null | undefined;
}): boolean {
  return Boolean(isAdmin || (viewerId && viewerId === authorId));
}

export function mapMarketCommentRecord(
  comment: MarketCommentRecord,
  tradeType: TradeType,
  now: Date = new Date()
): MarketComment {
  return {
    author: comment.author?.nickname || "익명 회원",
    createdAt: comment.created_at ? formatRelativeTime(comment.created_at, now) : "",
    id: String(comment.id),
    label: getCommentTypeLabel(comment.comment_type, tradeType),
    message: comment.content || ""
  };
}

export function mapMarketPostRecord(record: MarketPostRecord, now: Date = new Date()): MarketPost {
  const comments = (record.market_comments ?? []).map((comment) => mapMarketCommentRecord(comment, record.trade_type, now));

  return {
    authorId: record.author_id,
    authorName: record.profile?.nickname || "회원",
    authorRoleLabel: formatRoleLabel(record.profile?.role),
    badges: [getTradeTypeLabel(record.trade_type), getCategoryLabel(record.category)],
    category: getCategoryLabel(record.category),
    commentCount: comments.length,
    comments,
    content: record.content,
    createdAt: formatRelativeTime(record.created_at, now),
    createdAtIso: record.created_at,
    game: record.game?.name || "미분류 게임",
    gameSlug: record.game?.slug,
    id: String(record.id),
    price: record.price_label,
    quantity: record.quantity_description,
    server: record.server_name,
    status: record.status,
    summary: buildSummary(record.content),
    title: record.title,
    tradeType: record.trade_type,
    updatedAt: formatRelativeTime(record.updated_at, now),
    updatedAtIso: record.updated_at,
    views: record.view_count
  };
}

export function getGameTagClass(slug: string | null | undefined): string {
  if (!slug) return "";
  return `game-tag--${slug}`;
}

export function getMarketGames(posts: MarketPost[]): string[] {
  return Array.from(new Set(posts.map((post) => post.game)));
}

export function getGameStats(posts: MarketPost[] = []): Array<{ count: number; game: string; slug?: string }> {
  return getMarketGames(posts).map((game) => ({
    count: posts.filter((post) => post.game === game).length,
    game,
    slug: posts.find((post) => post.game === game)?.gameSlug
  }));
}

export function getGameNameBySlug(posts: MarketPost[] = [], slug: string): string | null {
  return posts.find((post) => post.gameSlug === slug)?.game ?? null;
}

interface FilterMarketPostsArgs {
  category?: string;
  game?: string;
  keyword?: string;
  posts?: MarketPost[];
  server?: string;
  status?: MarketStatus | "all";
  tradeType?: TradeType | "all";
}

export function filterMarketPosts({
  category = "all",
  game = "all",
  keyword = "",
  posts = [],
  server = "",
  status = "all",
  tradeType = "all"
}: FilterMarketPostsArgs): MarketPost[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedServer = server.trim().toLowerCase();

  return posts.filter((post) => {
    if (tradeType !== "all" && post.tradeType !== tradeType) {
      return false;
    }

    if (game !== "all" && post.game !== game) {
      return false;
    }

    if (status !== "all" && post.status !== status) {
      return false;
    }

    if (category !== "all" && post.category !== category) {
      return false;
    }

    if (normalizedKeyword) {
      const haystack = `${post.title || ""} ${post.game || ""} ${post.content || ""}`.toLowerCase();
      if (!haystack.includes(normalizedKeyword)) {
        return false;
      }
    }

    if (normalizedServer) {
      if ((post.server || "").toLowerCase() !== normalizedServer) {
        return false;
      }
    }

    return true;
  });
}

export function getMarketSummary(posts: MarketPost[] = []): {
  buyCount: number;
  closedCount: number;
  commentCount: number;
  openCount: number;
  sellCount: number;
  totalCount: number;
} {
  return posts.reduce(
    (summary, post) => ({
      buyCount: summary.buyCount + (post.tradeType === "buy" ? 1 : 0),
      closedCount: summary.closedCount + (post.status === "closed" ? 1 : 0),
      commentCount: summary.commentCount + (post.commentCount || post.comments.length),
      openCount: summary.openCount + (post.status === "open" ? 1 : 0),
      sellCount: summary.sellCount + (post.tradeType === "sell" ? 1 : 0),
      totalCount: summary.totalCount + 1
    }),
    {
      buyCount: 0,
      closedCount: 0,
      commentCount: 0,
      openCount: 0,
      sellCount: 0,
      totalCount: 0
    }
  );
}
