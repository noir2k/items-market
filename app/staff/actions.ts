"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDeleteConfirmation } from "../../lib/action-guards";
import { requireAdminAccess } from "../../lib/admin-server";

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
