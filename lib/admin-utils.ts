import { getStatusLabel, getTradeTypeLabel } from "./market-utils";
import type { AdminMemberProfile, MarketPost } from "./types";

function escapeCsvCell(value: string | number | null | undefined): string {
  const normalized = String(value ?? "").replace(/"/g, "\"\"");
  return `"${normalized}"`;
}

export function filterPostsByMonth<T extends { createdAtIso?: string }>(posts: T[], month: string | null | undefined): T[] {
  if (!month) {
    return posts;
  }

  return posts.filter((post) => {
    if (!post.createdAtIso) {
      return false;
    }

    return post.createdAtIso.slice(0, 7) === month;
  });
}

export function formatMonthOption(month: string): string {
  const [year, monthNumber] = month.split("-");
  return `${year}년 ${monthNumber}월`;
}

export function getMonthOptions(posts: Array<{ createdAtIso?: string }>): string[] {
  return Array.from(
    new Set(
      posts
        .map((post) => post.createdAtIso?.slice(0, 7))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((left, right) => (left < right ? 1 : -1));
}

export function getAdminSummary({
  members,
  posts
}: {
  members: Array<Pick<AdminMemberProfile, "id" | "status">>;
  posts: Array<Pick<MarketPost, "status">>;
}) {
  return {
    activeMembers: members.filter((member) => member.status === "active").length,
    closedPosts: posts.filter((post) => post.status === "closed").length,
    openPosts: posts.filter((post) => post.status === "open").length,
    suspendedMembers: members.filter((member) => member.status === "suspended").length,
    totalMembers: members.length,
    totalPosts: posts.length
  };
}

export function buildMemberPostsCsv({
  month,
  posts,
  profile
}: {
  month: string | null | undefined;
  posts: MarketPost[];
  profile: Pick<AdminMemberProfile, "email" | "nickname">;
}): string {
  const header = [
    "회원닉네임",
    "이메일",
    "조회월",
    "게시글ID",
    "거래유형",
    "상태",
    "게임",
    "카테고리",
    "서버",
    "제목",
    "가격",
    "수량/조건",
    "댓글수",
    "작성일",
    "수정일"
  ];

  const rows = posts.map((post) => [
    profile.nickname || "",
    profile.email || "",
    month || "전체",
    post.id,
    getTradeTypeLabel(post.tradeType),
    getStatusLabel(post.status),
    post.game,
    post.category,
    post.server || "",
    post.title || "",
    post.price || "",
    post.quantity || "",
    post.commentCount,
    post.createdAtIso || "",
    post.updatedAtIso || ""
  ]);

  return `\uFEFF${header.join(",")}\n${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")}`;
}
