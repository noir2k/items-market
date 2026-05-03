import { describe, expect, it } from "vitest";
import {
  canManageMarketPost,
  filterMarketPosts,
  getGameNameBySlug,
  getGameStats,
  getMarketSummary,
  getTradeTypeLabel,
  mapMarketPostRecord,
  normalizePriceInput
} from "../../lib/market-utils";

describe("normalizePriceInput", () => {
  it("extracts a numeric price and preserves a display label", () => {
    expect(normalizePriceInput("298,000원")).toEqual({
      price: 298000,
      priceLabel: "298,000원"
    });
  });

  it("falls back to negotiation labels when there is no numeric value", () => {
    expect(normalizePriceInput("협의")).toEqual({
      price: null,
      priceLabel: "협의"
    });
  });
});

describe("canManageMarketPost", () => {
  it("allows the author or an admin to manage a post", () => {
    expect(canManageMarketPost({ authorId: "author-1", isAdmin: false, viewerId: "author-1" })).toBe(true);
    expect(canManageMarketPost({ authorId: "author-1", isAdmin: true, viewerId: "viewer-1" })).toBe(true);
    expect(canManageMarketPost({ authorId: "author-1", isAdmin: false, viewerId: "viewer-1" })).toBe(false);
  });
});

describe("mapMarketPostRecord", () => {
  it("maps a Supabase-style post record into the UI shape", () => {
    const result = mapMarketPostRecord(
      {
        author_id: "author-1",
        category: "game_money",
        content: "메소 120억 보유 중이며 분할 거래 가능합니다.",
        created_at: "2026-04-27T11:40:00.000Z",
        game: {
          id: 10,
          name: "메이플스토리",
          slug: "maplestory"
        },
        id: 42,
        market_comments: [
          {
            author: {
              nickname: "raid_buyer"
            },
            comment_type: "inquiry",
            content: "60억만 먼저 거래 가능한지 문의드립니다.",
            created_at: "2026-04-27T11:58:00.000Z",
            id: 7
          }
        ],
        price: 298000,
        price_label: "298,000원",
        profile: {
          nickname: "meso_master",
          role: "member"
        },
        quantity_description: "120억 메소",
        server_name: "스카니아",
        status: "open",
        title: "스카니아 메소 120억 분할 판매",
        trade_type: "sell",
        updated_at: "2026-04-27T11:55:00.000Z",
        view_count: 184
      },
      new Date("2026-04-27T12:00:00.000Z")
    );

    expect(result).toMatchObject({
      authorId: "author-1",
      authorName: "meso_master",
      authorRoleLabel: "일반회원",
      badges: ["팝니다", "게임머니"],
      category: "게임머니",
      commentCount: 1,
      comments: [
        {
          author: "raid_buyer",
          id: "7",
          label: "구매문의",
          message: "60억만 먼저 거래 가능한지 문의드립니다."
        }
      ],
      game: "메이플스토리",
      gameSlug: "maplestory",
      id: "42",
      price: "298,000원",
      quantity: "120억 메소",
      server: "스카니아",
      status: "open",
      summary: "메소 120억 보유 중이며 분할 거래 가능합니다.",
      title: "스카니아 메소 120억 분할 판매",
      tradeType: "sell",
      updatedAt: "5분 전",
      views: 184
    });
  });
});

describe("market helpers", () => {
  it("filters posts by trade type, game, status, and category", () => {
    const result = filterMarketPosts({
      category: "게임머니",
      game: "메이플스토리",
      posts: [
        { id: "a", category: "게임머니", commentCount: 0, comments: [], game: "메이플스토리", status: "open", tradeType: "sell" },
        { id: "b", category: "게임머니", commentCount: 0, comments: [], game: "메이플스토리", status: "open", tradeType: "buy" },
        { id: "c", category: "아이템", commentCount: 0, comments: [], game: "메이플스토리", status: "closed", tradeType: "sell" }
      ],
      status: "open",
      tradeType: "sell"
    });

    expect(result.map((post) => post.id)).toEqual(["a"]);
  });

  it("returns summary counts for posts and comments", () => {
    const summary = getMarketSummary([
      { id: "a", commentCount: 2, comments: [{ id: "1" }, { id: "2" }], status: "open", tradeType: "sell" },
      { id: "b", commentCount: 0, comments: [], status: "closed", tradeType: "buy" }
    ]);

    expect(summary).toEqual({
      buyCount: 1,
      commentCount: 2,
      closedCount: 1,
      openCount: 1,
      sellCount: 1,
      totalCount: 2
    });
  });

  it("maps trade type codes to Korean labels", () => {
    expect(getTradeTypeLabel("buy")).toBe("삽니다");
    expect(getTradeTypeLabel("sell")).toBe("팝니다");
  });

  it("keeps game slugs available for independent board routes", () => {
    const posts = [
      { id: "a", category: "게임머니", commentCount: 0, comments: [], game: "메이플스토리", gameSlug: "maplestory", status: "open", tradeType: "sell" },
      { id: "b", category: "계정", commentCount: 0, comments: [], game: "FC Online", gameSlug: "fc-online", status: "open", tradeType: "buy" }
    ];

    expect(getGameStats(posts)).toEqual([
      { count: 1, game: "메이플스토리", slug: "maplestory" },
      { count: 1, game: "FC Online", slug: "fc-online" }
    ]);
    expect(getGameNameBySlug(posts, "fc-online")).toBe("FC Online");
    expect(getGameNameBySlug(posts, "missing")).toBeNull();
  });
});
