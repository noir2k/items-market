import type { NextRequest } from "next/server";
import { buildMemberPostsCsv, filterPostsByMonth } from "../../../lib/admin-utils";
import { getAdminMemberById, requireAdminAccess } from "../../../lib/admin-server";
import { listPostsByAuthor } from "../../../lib/market-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdminAccess();

  if (!admin) {
    return new Response("관리자 권한이 필요합니다.", { status: 403 });
  }

  const memberId = request.nextUrl.searchParams.get("memberId");
  const month = request.nextUrl.searchParams.get("month");

  if (!memberId) {
    return new Response("memberId is required.", { status: 400 });
  }

  const [profile, posts] = await Promise.all([getAdminMemberById(memberId), listPostsByAuthor(memberId)]);

  if (!profile) {
    return new Response("회원을 찾을 수 없습니다.", { status: 404 });
  }

  const filteredPosts = filterPostsByMonth(posts, month);
  const csv = buildMemberPostsCsv({
    month,
    posts: filteredPosts,
    profile
  });
  const safeNickname = (profile.nickname || "member").replace(/[^\w가-힣-]+/g, "-");
  const suffix = month || "all";

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${safeNickname}-${suffix}-posts.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
