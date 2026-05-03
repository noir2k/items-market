import { describe, expect, it } from "vitest";
import {
  buildMemberPostsCsv,
  filterPostsByMonth,
  formatMonthOption,
  getAdminSummary
} from "../../lib/admin-utils";
import type { MarketPost } from "../../lib/types";

const posts: MarketPost[] = [
  {
    authorName: "member_a",
    category: "게임머니",
    commentCount: 2,
    createdAtIso: "2026-04-05T11:00:00.000Z",
    game: "메이플스토리",
    id: "101",
    price: "298,000원",
    quantity: "120억 메소",
    server: "스카니아",
    status: "open",
    title: "스카니아 메소 120억 분할 판매",
    tradeType: "sell",
    updatedAtIso: "2026-04-05T11:30:00.000Z",
    comments: []
  },
  {
    authorName: "member_a",
    category: "아이템",
    commentCount: 1,
    createdAtIso: "2026-03-15T10:00:00.000Z",
    game: "로스트아크",
    id: "102",
    price: "협의",
    quantity: "전설 카드 선택팩 1세트",
    server: "카단",
    status: "closed",
    title: "로스트아크 전설 카드 선택팩 삽니다",
    tradeType: "buy",
    updatedAtIso: "2026-03-15T12:00:00.000Z",
    comments: []
  }
];

describe("filterPostsByMonth", () => {
  it("keeps only posts created in the requested month", () => {
    expect(filterPostsByMonth(posts, "2026-04").map((post) => post.id)).toEqual(["101"]);
    expect(filterPostsByMonth(posts, "2026-03").map((post) => post.id)).toEqual(["102"]);
  });

  it("returns all posts when no month filter is provided", () => {
    expect(filterPostsByMonth(posts, null).map((post) => post.id)).toEqual(["101", "102"]);
  });
});

describe("formatMonthOption", () => {
  it("formats a month value for labels", () => {
    expect(formatMonthOption("2026-04")).toBe("2026년 04월");
  });
});

describe("getAdminSummary", () => {
  it("builds dashboard counts from posts and members", () => {
    expect(
      getAdminSummary({
        members: [
          { id: "m1", status: "active" },
          { id: "m2", status: "suspended" }
        ],
        posts
      })
    ).toEqual({
      activeMembers: 1,
      closedPosts: 1,
      openPosts: 1,
      suspendedMembers: 1,
      totalMembers: 2,
      totalPosts: 2
    });
  });
});

describe("buildMemberPostsCsv", () => {
  it("creates an excel-friendly CSV with a BOM and Korean headers", () => {
    const csv = buildMemberPostsCsv({
      month: "2026-04",
      posts: filterPostsByMonth(posts, "2026-04"),
      profile: {
        email: "member-a@example.com",
        nickname: "member_a"
      }
    });

    expect(csv.startsWith("\uFEFF회원닉네임,이메일,조회월,게시글ID")).toBe(true);
    expect(csv).toContain("\"member_a\",\"member-a@example.com\",\"2026-04\",\"101\",\"팝니다\",\"거래중\"");
    expect(csv).toContain("스카니아 메소 120억 분할 판매");
  });
});
