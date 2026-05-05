import { filterPostsByMonth, getAdminSummary, getMonthOptions } from "./admin-utils";
import { listMarketPosts, listPostsByAuthor, MARKET_POST_LIST_SELECT, normalizeRecordShape } from "./market-server";
import { mapMarketPostRecord } from "./market-utils";
import { isAdminProfile } from "./auth-utils";
import { createClient, getCurrentProfile } from "./supabase/server";
import type { AdminMemberProfile, GameGenre, MarketPost } from "./types";

export interface AdminGameRow {
  id: number;
  slug: string;
  name: string;
  genre: GameGenre | null;
  iconPath: string | null;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
  openPostCount: number;
}

export interface AdminMemberWithStats extends AdminMemberProfile {
  closedPostCount: number;
  openPostCount: number;
  postCount: number;
  /** 회원이 1건 이상 작성한 게임 slug 집합 — 게임별 필터/표시에 사용 */
  gameSlugs: string[];
}

export interface AdminMemberFilter {
  /** 닉네임/이메일 substring (대소문자 무시) */
  search?: string | null;
  status?: "all" | "active" | "suspended" | null;
  /** 활동 분류 — trading: 거래중 글 1건+, idle: 게시글 0, all: 무관 */
  activity?: "all" | "trading" | "idle" | null;
  /** 회원이 게시글을 올린 게임 slug. 'all' 또는 null이면 무관 */
  gameSlug?: string | null;
}

export function filterAdminMembers(
  members: AdminMemberWithStats[],
  filter: AdminMemberFilter
): AdminMemberWithStats[] {
  const search = filter.search?.trim().toLowerCase() || "";

  return members.filter((member) => {
    if (search) {
      const haystack = `${member.nickname || ""} ${member.email || ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filter.status && filter.status !== "all") {
      if (member.status !== filter.status) return false;
    }

    if (filter.activity === "trading" && member.openPostCount === 0) return false;
    if (filter.activity === "idle" && member.postCount > 0) return false;

    if (filter.gameSlug && filter.gameSlug !== "all") {
      if (!member.gameSlugs.includes(filter.gameSlug)) return false;
    }

    return true;
  });
}

export async function requireAdminAccess() {
  const supabase = await createClient();
  const { profile, user } = await getCurrentProfile();

  if (!user || !isAdminProfile(profile)) {
    return null;
  }

  return {
    profile,
    supabase,
    user
  };
}

export async function listAdminMembers(): Promise<AdminMemberProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminMemberProfile[];
}

export async function getAdminMemberById(memberId: string): Promise<AdminMemberProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, status, created_at")
    .eq("id", memberId)
    .single();

  if (error) {
    return null;
  }

  return data as AdminMemberProfile;
}

export async function getAdminDashboardData({
  memberId,
  month
}: {
  memberId?: string | null;
  month?: string | null;
}) {
  const [members, posts] = await Promise.all([listAdminMembers(), listMarketPosts()]);

  interface MemberAggregate {
    closedPostCount: number;
    gameSlugSet: Set<string>;
    openPostCount: number;
    postCount: number;
  }

  const aggregateByMemberId = posts.reduce<Record<string, MemberAggregate>>((accumulator, post) => {
    const key = post.authorId || "unknown";
    const current =
      accumulator[key] ||
      ({
        closedPostCount: 0,
        gameSlugSet: new Set<string>(),
        openPostCount: 0,
        postCount: 0
      } as MemberAggregate);

    current.postCount += 1;
    current.openPostCount += post.status === "open" ? 1 : 0;
    current.closedPostCount += post.status === "closed" ? 1 : 0;
    if (post.gameSlug) {
      current.gameSlugSet.add(post.gameSlug);
    }
    accumulator[key] = current;
    return accumulator;
  }, {});

  const membersWithStats: AdminMemberWithStats[] = members.map((member) => {
    const aggregate = aggregateByMemberId[member.id];
    return {
      ...member,
      closedPostCount: aggregate?.closedPostCount ?? 0,
      gameSlugs: aggregate ? Array.from(aggregate.gameSlugSet).sort() : [],
      openPostCount: aggregate?.openPostCount ?? 0,
      postCount: aggregate?.postCount ?? 0
    };
  });

  const summary = getAdminSummary({
    members,
    posts
  });

  let selectedMember: AdminMemberProfile | null = null;
  let selectedMemberPosts: MarketPost[] = [];

  if (memberId) {
    [selectedMember, selectedMemberPosts] = await Promise.all([
      getAdminMemberById(memberId),
      listPostsByAuthor(memberId)
    ]);
  }

  const selectedMemberMonthOptions = getMonthOptions(selectedMemberPosts);
  const filteredSelectedMemberPosts = filterPostsByMonth(selectedMemberPosts, month);

  return {
    members: membersWithStats,
    monthOptions: selectedMemberMonthOptions,
    posts,
    selectedMember,
    selectedMemberPosts: filteredSelectedMemberPosts,
    summary
  };
}

interface RawAdminGameRow {
  id: number;
  slug: string;
  name: string;
  genre: GameGenre | null;
  icon_path: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AdminPostFilter {
  gameSlug?: string | null;
  genre?: GameGenre | null;
  status?: "open" | "closed" | "all" | null;
}

export function filterAdminPosts(posts: MarketPost[], filter: AdminPostFilter, gamesBySlug: Record<string, AdminGameRow>): MarketPost[] {
  return posts.filter((post) => {
    if (filter.gameSlug && filter.gameSlug !== "all") {
      if (post.gameSlug !== filter.gameSlug) return false;
    }
    if (filter.genre && filter.genre !== ("all" as GameGenre)) {
      const game = post.gameSlug ? gamesBySlug[post.gameSlug] : undefined;
      if (!game || game.genre !== filter.genre) return false;
    }
    if (filter.status && filter.status !== "all") {
      if (post.status !== filter.status) return false;
    }
    return true;
  });
}

export async function listAdminGames(): Promise<AdminGameRow[]> {
  const supabase = await createClient();

  const [gamesResult, postsResult] = await Promise.all([
    supabase
      .from("games")
      .select("id, slug, name, genre, icon_path, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase.from("market_posts").select("game_id, status")
  ]);

  if (gamesResult.error) {
    throw new Error(gamesResult.error.message);
  }

  if (postsResult.error) {
    throw new Error(postsResult.error.message);
  }

  const posts = (postsResult.data ?? []) as Array<{ game_id: number; status: string }>;
  const games = (gamesResult.data ?? []) as RawAdminGameRow[];

  return games.map((game) => {
    const gamePosts = posts.filter((post) => post.game_id === game.id);
    return {
      genre: game.genre,
      iconPath: game.icon_path,
      id: game.id,
      isActive: game.is_active,
      name: game.name,
      openPostCount: gamePosts.filter((post) => post.status === "open").length,
      postCount: gamePosts.length,
      slug: game.slug,
      sortOrder: game.sort_order
    };
  });
}

/**
 * SQL GROUP BY view를 활용한 게임 카탈로그 + 카운트 조회.
 * 위 listAdminGames와 동일한 결과를 반환하되, 모든 market_posts 행을 fetch하지 않고
 * `game_post_counts` 집계 view를 join하여 28번의 reduce 대신 28개 행만 받는다.
 */
export async function listAdminGamesWithViewCounts(): Promise<AdminGameRow[]> {
  const supabase = await createClient();

  const [gamesResult, countsResult] = await Promise.all([
    supabase
      .from("games")
      .select("id, slug, name, genre, icon_path, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase.from("game_post_counts").select("game_id, total_count, open_count")
  ]);

  if (gamesResult.error) throw new Error(gamesResult.error.message);
  if (countsResult.error) throw new Error(countsResult.error.message);

  const countsByGameId = new Map<number, { total: number; open: number }>(
    ((countsResult.data ?? []) as Array<{ game_id: number; total_count: number; open_count: number }>).map(
      (row) => [row.game_id, { open: row.open_count, total: row.total_count }]
    )
  );

  return ((gamesResult.data ?? []) as RawAdminGameRow[]).map((game) => {
    const counts = countsByGameId.get(game.id);
    return {
      genre: game.genre,
      iconPath: game.icon_path,
      id: game.id,
      isActive: game.is_active,
      name: game.name,
      openPostCount: counts?.open ?? 0,
      postCount: counts?.total ?? 0,
      slug: game.slug,
      sortOrder: game.sort_order
    };
  });
}

/**
 * /staff/posts 용 SQL offset 페이지네이션. count: 'exact'로 totalCount를 같이 받아
 * 클라이언트에서 페이지 수 계산 가능. 게임/장르/상태 필터를 SQL 단계에서 처리.
 */
export async function listAdminPostsPaged({
  page = 1,
  pageSize = 20,
  filter
}: {
  page?: number;
  pageSize?: number;
  filter?: AdminPostFilter;
}): Promise<{ posts: MarketPost[]; totalCount: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // gameSlug -> game_id resolve (slug 필터 시 join 대신 단순 ID 비교)
  let gameIdFilter: number | null = null;
  if (filter?.gameSlug && filter.gameSlug !== "all") {
    const { data: gameRow } = await supabase
      .from("games")
      .select("id")
      .eq("slug", filter.gameSlug)
      .single();
    if (!gameRow) return { posts: [], totalCount: 0 };
    gameIdFilter = (gameRow as { id: number }).id;
  }

  // 장르 필터는 games 테이블 inner join + .eq("game.genre", X)로 처리
  const useGenreFilter = Boolean(filter?.genre && filter.genre !== ("all" as GameGenre));
  const select = useGenreFilter
    ? MARKET_POST_LIST_SELECT.replace("game:games(", "game:games!inner(")
    : MARKET_POST_LIST_SELECT;

  let query = supabase
    .from("market_posts")
    .select(select, { count: "exact" })
    .order("created_at", { ascending: false });

  if (gameIdFilter !== null) {
    query = query.eq("game_id", gameIdFilter);
  }
  if (useGenreFilter && filter?.genre) {
    query = query.eq("game.genre", filter.genre);
  }
  if (filter?.status === "open" || filter?.status === "closed") {
    query = query.eq("status", filter.status);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const posts = ((data ?? []) as Array<unknown>).map((record) =>
    mapMarketPostRecord(normalizeRecordShape(record))
  );
  return { posts, totalCount: count ?? 0 };
}

/**
 * /staff/members SQL 페이징 — profile_post_summary view 단일 쿼리.
 * 검색(ilike)/상태/활동(open_post_count·post_count)/게임 slug(array contains) 필터를
 * SQL 단계에서 처리하고 .range로 페이지 슬라이스 + count: 'exact'으로 totalCount 반환.
 *
 * 메모리 페이징 대비 장점:
 *   - 1k+ 회원 시점에도 SSR fetch가 page size만큼 경량
 *   - 필터별 totalCount가 SQL 단계에서 정확
 *   - 인덱스 활용 (search ilike는 인덱스 없으면 seq scan이지만 nickname/email은 작은 컬럼)
 */
export async function listAdminMembersPaged({
  page = 1,
  pageSize = 20,
  filter
}: {
  page?: number;
  pageSize?: number;
  filter: AdminMemberFilter;
}): Promise<{ members: AdminMemberWithStats[]; totalCount: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profile_post_summary")
    .select(
      "profile_id, post_count, open_post_count, closed_post_count, game_slugs, profile_email, profile_nickname, profile_role, profile_status, profile_created_at",
      { count: "exact" }
    )
    .order("profile_created_at", { ascending: false });

  // 검색 (닉네임 OR 이메일)
  const search = filter.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, ""); // PostgREST 안전 처리
    if (escaped) {
      query = query.or(
        `profile_nickname.ilike.%${escaped}%,profile_email.ilike.%${escaped}%`
      );
    }
  }

  if (filter.status === "active" || filter.status === "suspended") {
    query = query.eq("profile_status", filter.status);
  }

  if (filter.activity === "trading") {
    query = query.gt("open_post_count", 0);
  } else if (filter.activity === "idle") {
    query = query.eq("post_count", 0);
  }

  if (filter.gameSlug && filter.gameSlug !== "all") {
    query = query.contains("game_slugs", [filter.gameSlug]);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  type Row = {
    closed_post_count: number;
    game_slugs: string[];
    open_post_count: number;
    post_count: number;
    profile_created_at: string | null;
    profile_email: string | null;
    profile_id: string;
    profile_nickname: string | null;
    profile_role: AdminMemberProfile["role"];
    profile_status: AdminMemberProfile["status"];
  };

  const members: AdminMemberWithStats[] = ((data ?? []) as Row[]).map((row) => ({
    closedPostCount: row.closed_post_count,
    created_at: row.profile_created_at ?? undefined,
    email: row.profile_email ?? undefined,
    gameSlugs: row.game_slugs ?? [],
    id: row.profile_id,
    nickname: row.profile_nickname ?? undefined,
    openPostCount: row.open_post_count,
    postCount: row.post_count,
    role: row.profile_role,
    status: row.profile_status
  }));

  return { members, totalCount: count ?? 0 };
}

/**
 * 회원 1명의 최근 게시글 (인라인 detail용). 기본 limit 20건.
 * month YYYY-MM가 주어지면 해당 월로 한정.
 */
export async function listMemberPostsRecent({
  memberId,
  month,
  limit = 20
}: {
  memberId: string;
  month?: string | null;
  limit?: number;
}): Promise<{ posts: MarketPost[]; totalCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("market_posts")
    .select(MARKET_POST_LIST_SELECT, { count: "exact" })
    .eq("author_id", memberId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (month) {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const posts = ((data ?? []) as Array<unknown>).map((record) =>
    mapMarketPostRecord(normalizeRecordShape(record))
  );
  return { posts, totalCount: count ?? 0 };
}
