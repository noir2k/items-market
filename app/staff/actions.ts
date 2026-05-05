"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireDeleteConfirmation } from "../../lib/action-guards";
import { requireAdminAccess } from "../../lib/admin-server";
import { getLocalSupabaseConfig } from "../../lib/supabase-local";
import { createClient } from "../../lib/supabase/server";
import type { GameGenre } from "../../lib/types";

const VALID_GENRES: GameGenre[] = [
  "mmorpg_pc",
  "mmorpg_mobile",
  "rpg_mobile",
  "action",
  "sports",
  "fps",
  "moba",
  "casual",
  "other"
];

const IMPERSONATION_COOKIE = "staff-impersonating-from";

function rethrowRedirectError(error: unknown): void {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = String((error as { digest?: string }).digest || "");

    if (digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
  }
}

function redirectWithError(message: string, returnPath: string, memberId?: string) {
  const base = memberId
    ? `${returnPath}${returnPath.includes("?") ? "&" : "?"}memberId=${encodeURIComponent(memberId)}`
    : returnPath;
  redirect(`${base}${base.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

function redirectWithMessage(message: string, returnPath: string, memberId?: string) {
  const base = memberId
    ? `${returnPath}${returnPath.includes("?") ? "&" : "?"}memberId=${encodeURIComponent(memberId)}`
    : returnPath;
  redirect(`${base}${base.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`);
}

export async function updateMemberStatusAction(memberId: string, nextStatus: "active" | "suspended") {
  const returnPath = "/staff/members";
  try {
    const admin = await requireAdminAccess();

    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    if (admin.user.id === memberId && nextStatus === "suspended") {
      throw new Error("현재 로그인한 관리자 본인은 정지 처리할 수 없습니다.");
    }

    const { data: targetMember, error: targetMemberError } = await admin.supabase
      .from("profiles")
      .select("id, role")
      .eq("id", memberId)
      .single();

    if (targetMemberError || !targetMember) {
      throw new Error("대상 회원을 찾을 수 없습니다.");
    }

    if (targetMember.role === "admin" && nextStatus === "suspended") {
      throw new Error("관리자 계정 정지는 별도 승인 정책이 필요합니다.");
    }

    const { error } = await admin.supabase.from("profiles").update({ status: nextStatus }).eq("id", memberId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/staff");
    revalidatePath("/staff/members");
    revalidatePath("/market");
    revalidatePath("/mypage");
    redirectWithMessage("회원 상태가 변경되었습니다.", returnPath, memberId);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "회원 상태 변경 중 오류가 발생했습니다.",
      returnPath,
      memberId
    );
  }
}

export async function adminCloseMarketPostAction(postId: string) {
  const returnPath = "/staff/posts";
  try {
    const admin = await requireAdminAccess();

    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    const { data: post, error: postError } = await admin.supabase
      .from("market_posts")
      .select("id, status")
      .eq("id", Number(postId))
      .single();

    if (postError || !post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    if (post.status === "closed") {
      redirectWithMessage("이미 거래완료된 게시글입니다.", returnPath);
    }

    const { error } = await admin.supabase
      .from("market_posts")
      .update({
        closed_at: new Date().toISOString(),
        closed_by: admin.user.id,
        status: "closed"
      })
      .eq("id", post.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/staff");
    revalidatePath("/staff/posts");
    revalidatePath("/market");
    revalidatePath(`/market/${post.id}`);
    revalidatePath("/mypage");
    redirectWithMessage("게시글이 거래완료 처리되었습니다.", returnPath);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "거래완료 처리 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

export async function adminDeleteMarketPostAction(postId: string, formData: FormData) {
  const returnPath = "/staff/posts";
  try {
    requireDeleteConfirmation(formData);
    const admin = await requireAdminAccess();

    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    const { data: post, error: postError } = await admin.supabase
      .from("market_posts")
      .select("id")
      .eq("id", Number(postId))
      .single();

    if (postError || !post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    const { error } = await admin.supabase.from("market_posts").delete().eq("id", post.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/staff");
    revalidatePath("/staff/posts");
    revalidatePath("/market");
    revalidatePath(`/market/${post.id}`);
    revalidatePath("/mypage");
    redirectWithMessage("게시글이 삭제되었습니다.", returnPath);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "게시글 삭제 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

export async function toggleGameActiveAction(gameId: number, nextActive: boolean) {
  const returnPath = "/staff/games";
  try {
    const admin = await requireAdminAccess();

    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    const { error } = await admin.supabase
      .from("games")
      .update({ is_active: nextActive })
      .eq("id", gameId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/staff/games");
    revalidatePath("/market");
    redirectWithMessage(
      nextActive ? "게시판이 노출 처리되었습니다." : "게시판이 숨김 처리되었습니다.",
      returnPath
    );
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "게시판 상태 변경 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

// ════════════════════════════════════════════════════════════════
// 게임 카탈로그 CRUD — /staff/games
// ════════════════════════════════════════════════════════════════

function parseGameForm(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const genre = String(formData.get("genre") || "other") as GameGenre;
  const sortOrderRaw = String(formData.get("sort_order") || "0").trim();
  const iconPath = String(formData.get("icon_path") || "").trim() || null;
  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("slug는 소문자/숫자/하이픈만 가능합니다.");
  }
  if (!name) {
    throw new Error("게임 이름을 입력해 주세요.");
  }
  if (!VALID_GENRES.includes(genre)) {
    throw new Error("유효하지 않은 장르입니다.");
  }
  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    throw new Error("sort_order는 0 이상의 정수여야 합니다.");
  }

  return { genre, iconPath, name, slug, sortOrder };
}

export async function createGameAction(formData: FormData) {
  const returnPath = "/staff/games";
  try {
    const admin = await requireAdminAccess();
    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    const fields = parseGameForm(formData);

    const { error } = await admin.supabase.from("games").insert({
      genre: fields.genre,
      icon_path: fields.iconPath,
      is_active: true,
      name: fields.name,
      slug: fields.slug,
      sort_order: fields.sortOrder
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error(`이미 존재하는 slug입니다: ${fields.slug}`);
      }
      throw new Error(error.message);
    }

    revalidatePath("/staff/games");
    revalidatePath("/market");
    redirectWithMessage(`${fields.name} 게시판이 추가되었습니다.`, returnPath);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "게시판 추가 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

export async function updateGameAction(gameId: number, formData: FormData) {
  const returnPath = "/staff/games";
  try {
    const admin = await requireAdminAccess();
    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    const name = String(formData.get("name") || "").trim();
    const genre = String(formData.get("genre") || "other") as GameGenre;
    const sortOrderRaw = String(formData.get("sort_order") || "0").trim();
    const iconPath = String(formData.get("icon_path") || "").trim() || null;
    const sortOrder = Number.parseInt(sortOrderRaw, 10);

    if (!name) throw new Error("게임 이름을 입력해 주세요.");
    if (!VALID_GENRES.includes(genre)) throw new Error("유효하지 않은 장르입니다.");
    if (!Number.isFinite(sortOrder) || sortOrder < 0) throw new Error("sort_order는 0 이상이어야 합니다.");

    const { error } = await admin.supabase
      .from("games")
      .update({
        genre,
        icon_path: iconPath,
        name,
        sort_order: sortOrder
      })
      .eq("id", gameId);

    if (error) throw new Error(error.message);

    revalidatePath("/staff/games");
    revalidatePath("/market");
    redirectWithMessage("게시판이 수정되었습니다.", returnPath);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "게시판 수정 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

export async function deleteGameAction(gameId: number, formData: FormData) {
  const returnPath = "/staff/games";
  try {
    requireDeleteConfirmation(formData);
    const admin = await requireAdminAccess();
    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    // 안전: 게시글이 있으면 삭제 거부
    const { count, error: countError } = await admin.supabase
      .from("market_posts")
      .select("id", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      throw new Error(`이 게시판에 ${count}건의 게시글이 있어 삭제할 수 없습니다. 먼저 숨김 처리를 사용하세요.`);
    }

    const { error } = await admin.supabase.from("games").delete().eq("id", gameId);
    if (error) throw new Error(error.message);

    revalidatePath("/staff/games");
    revalidatePath("/market");
    redirectWithMessage("게시판이 삭제되었습니다.", returnPath);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "게시판 삭제 중 오류가 발생했습니다.",
      returnPath
    );
  }
}

// ════════════════════════════════════════════════════════════════
// 사용자 가장 로그인 (Impersonation) — /staff/members
// 원래 admin user_id를 별도 cookie에 저장하고, 대상 사용자의 세션
// 토큰으로 교체한다. 복귀 시 cookie의 admin id를 읽어 원래 세션을 복원.
// ════════════════════════════════════════════════════════════════

async function createServiceRoleAdminClient() {
  const { serviceRoleKey, supabaseUrl } = getLocalSupabaseConfig();
  return createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function exchangeMagicLinkForSession(email: string) {
  const serviceClient = await createServiceRoleAdminClient();
  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    email,
    type: "magiclink"
  });

  if (linkError || !linkData) {
    throw new Error(`Magic link 생성 실패: ${linkError?.message || "알 수 없는 오류"}`);
  }

  const otp = (linkData as { properties?: { email_otp?: string } }).properties?.email_otp;
  if (!otp) {
    throw new Error("OTP 토큰을 추출할 수 없습니다.");
  }

  // SSR client (쿠키 스토어 연결됨) — 여기서 verifyOtp로 세션 발급 시
  // 자동으로 sb-{ref}-auth-token 쿠키가 write 됨
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email"
  });

  if (verifyError) {
    throw new Error(`세션 발급 실패: ${verifyError.message}`);
  }
}

export async function impersonateMemberAction(memberId: string) {
  try {
    const admin = await requireAdminAccess();
    if (!admin) {
      redirect("/staff/login?error=" + encodeURIComponent("관리자 로그인 후 접근해 주세요."));
    }

    if (admin.user.id === memberId) {
      throw new Error("본인 계정은 가장 로그인할 수 없습니다.");
    }

    const { data: target, error: targetError } = await admin.supabase
      .from("profiles")
      .select("id, email, role, nickname, status")
      .eq("id", memberId)
      .single();

    if (targetError || !target) {
      throw new Error("대상 회원을 찾을 수 없습니다.");
    }
    if (target.role === "admin") {
      throw new Error("다른 관리자 계정은 가장 로그인할 수 없습니다.");
    }
    if (target.status === "suspended") {
      throw new Error("정지된 회원 계정은 가장 로그인할 수 없습니다.");
    }
    if (!target.email) {
      throw new Error("대상 회원 이메일이 등록되어 있지 않습니다.");
    }

    // 1) 원래 admin user_id를 cookie에 저장 (복귀 단서)
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, admin.user.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8시간
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    // 2) 대상 사용자 세션으로 교체
    await exchangeMagicLinkForSession(target.email);

    // 3) 일반 거래소로 진입 (가장 상태로 활동)
    revalidatePath("/", "layout");
    redirect(`/market?impersonating=${encodeURIComponent(target.nickname || target.email)}`);
  } catch (error) {
    rethrowRedirectError(error);
    redirectWithError(
      error instanceof Error ? error.message : "가장 로그인 처리 중 오류가 발생했습니다.",
      "/staff/members"
    );
  }
}

export async function revertImpersonationAction() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

    if (!adminId) {
      redirect("/staff/login?error=" + encodeURIComponent("진입 정보를 찾을 수 없습니다."));
    }

    const serviceClient = await createServiceRoleAdminClient();
    const { data: adminProfile, error: adminError } = await serviceClient
      .from("profiles")
      .select("email, role, status")
      .eq("id", adminId)
      .single();

    if (adminError || !adminProfile) {
      cookieStore.delete(IMPERSONATION_COOKIE);
      redirect("/staff/login?error=" + encodeURIComponent("원래 관리자 계정 정보를 찾지 못했습니다."));
    }

    if (adminProfile.role !== "admin" || adminProfile.status !== "active") {
      cookieStore.delete(IMPERSONATION_COOKIE);
      redirect("/staff/login?error=" + encodeURIComponent("원래 관리자 계정이 더 이상 유효하지 않습니다."));
    }

    if (!adminProfile.email) {
      cookieStore.delete(IMPERSONATION_COOKIE);
      redirect("/staff/login?error=" + encodeURIComponent("관리자 이메일이 등록되어 있지 않습니다."));
    }

    // admin 세션으로 교체
    await exchangeMagicLinkForSession(adminProfile.email);

    // impersonation cookie 제거
    cookieStore.delete(IMPERSONATION_COOKIE);

    revalidatePath("/", "layout");
    redirect("/staff/members?message=" + encodeURIComponent("관리자 세션으로 복귀했습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "복귀 처리 중 오류"));
  }
}
