"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDeleteConfirmation } from "../../lib/action-guards";
import { isAdminProfile } from "../../lib/auth-utils";
import { getCategoryCode, normalizePriceInput } from "../../lib/market-utils";
import { createClient } from "../../lib/supabase/server";

function rethrowRedirectError(error: unknown): void {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = String((error as { digest?: string }).digest || "");

    if (digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
  }
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
}

function readText(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

function encodeMessage(pathname: string, type: "error" | "message", message: string): string {
  const query = `${type}=${encodeURIComponent(message)}`;
  return pathname.includes("?") ? `${pathname}&${query}` : `${pathname}?${query}`;
}

async function requireViewer() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/market")}&error=${encodeURIComponent("로그인 후 이용해 주세요.")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active") {
    redirect(`/login?error=${encodeURIComponent("활성 회원만 게시판 기능을 사용할 수 있습니다.")}`);
  }

  return {
    isAdmin: isAdminProfile(profile),
    profile,
    supabase,
    user
  };
}

function buildPostPayload(formData: FormData, authorId: string) {
  const title = readText(formData, "title");
  const content = readText(formData, "content");
  const serverName = readText(formData, "serverName");
  const quantityDescription = readText(formData, "quantityDescription");
  const gameId = Number(readText(formData, "gameId"));
  const tradeType = readText(formData, "tradeType");
  const category = readText(formData, "category");
  const { price, priceLabel } = normalizePriceInput(readText(formData, "priceLabel"));

  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw new Error("게임을 선택해 주세요.");
  }

  if (title.length < 5) {
    throw new Error("제목은 5자 이상 입력해 주세요.");
  }

  if (content.length < 10) {
    throw new Error("상세 설명은 10자 이상 입력해 주세요.");
  }

  if (quantityDescription.length < 2) {
    throw new Error("수량 또는 거래 조건을 입력해 주세요.");
  }

  if (serverName.length < 1) {
    throw new Error("서버 / 월드를 입력해 주세요.");
  }

  if (tradeType !== "buy" && tradeType !== "sell") {
    throw new Error("거래 유형이 올바르지 않습니다.");
  }

  return {
    author_id: authorId,
    category: getCategoryCode(category),
    content,
    game_id: gameId,
    price,
    price_label: priceLabel,
    quantity_description: quantityDescription,
    server_name: serverName,
    title,
    trade_type: tradeType
  };
}

async function loadManageablePost(postId: string) {
  const numericId = Number(postId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("게시글 번호가 올바르지 않습니다.");
  }

  const viewer = await requireViewer();
  const { data: post, error } = await viewer.supabase
    .from("market_posts")
    .select("id, author_id, trade_type, status")
    .eq("id", numericId)
    .single();

  if (error || !post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  if (!viewer.isAdmin && post.author_id !== viewer.user.id) {
    throw new Error("해당 게시글을 관리할 권한이 없습니다.");
  }

  return {
    ...viewer,
    post
  };
}

function revalidateMarketPaths(postId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/market");
  revalidatePath("/sell");
  revalidatePath("/buy");
  revalidatePath("/mypage");

  if (postId) {
    revalidatePath(`/market/${postId}`);
    revalidatePath(`/market/${postId}/edit`);
  }
}

export async function createMarketPostAction(formData: FormData) {
  try {
    const viewer = await requireViewer();
    const payload = buildPostPayload(formData, viewer.user.id);
    const { data, error } = await viewer.supabase.from("market_posts").insert(payload).select("id").single();

    if (error || !data) {
      throw new Error(error?.message || "게시글 등록에 실패했습니다.");
    }

    revalidateMarketPaths(String(data.id));
    redirect(encodeMessage(`/market/${data.id}`, "message", "거래 글이 등록되었습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    const tradeType = readText(formData, "tradeType");
    const fallbackPath = tradeType === "buy" ? "/buy" : "/sell";
    redirect(encodeMessage(fallbackPath, "error", toErrorMessage(error)));
  }
}

export async function updateMarketPostAction(postId: string, formData: FormData) {
  try {
    const { post, supabase } = await loadManageablePost(postId);
    const payload = buildPostPayload(formData, post.author_id);
    const { error } = await supabase.from("market_posts").update(payload).eq("id", post.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateMarketPaths(String(post.id));
    redirect(encodeMessage(`/market/${post.id}`, "message", "게시글이 수정되었습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    redirect(encodeMessage(`/market/${postId}/edit`, "error", toErrorMessage(error)));
  }
}

export async function createMarketCommentAction(postId: string, formData: FormData) {
  try {
    const viewer = await requireViewer();
    const content = readText(formData, "content");
    const numericId = Number(postId);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error("게시글 번호가 올바르지 않습니다.");
    }

    if (content.length < 2) {
      throw new Error("댓글은 2자 이상 입력해 주세요.");
    }

    const { data: post, error: postError } = await viewer.supabase
      .from("market_posts")
      .select("id, trade_type, status")
      .eq("id", numericId)
      .single();

    if (postError || !post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    if (post.status === "closed") {
      throw new Error("거래완료된 글에는 새 댓글을 남길 수 없습니다.");
    }

    const { error } = await viewer.supabase.from("market_comments").insert({
      author_id: viewer.user.id,
      comment_type: post.trade_type === "sell" ? "inquiry" : "offer",
      content,
      post_id: post.id
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateMarketPaths(String(post.id));
    redirect(encodeMessage(`/market/${post.id}`, "message", "댓글이 등록되었습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    redirect(encodeMessage(`/market/${postId}`, "error", toErrorMessage(error)));
  }
}

export async function closeMarketPostAction(postId: string) {
  try {
    const { post, supabase, user } = await loadManageablePost(postId);

    if (post.status === "closed") {
      redirect(`/market/${post.id}`);
    }

    const { error } = await supabase
      .from("market_posts")
      .update({
        closed_at: new Date().toISOString(),
        closed_by: user.id,
        status: "closed"
      })
      .eq("id", post.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateMarketPaths(String(post.id));
    redirect(encodeMessage(`/market/${post.id}`, "message", "거래가 완료 처리되었습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    redirect(encodeMessage(`/market/${postId}`, "error", toErrorMessage(error)));
  }
}

export async function deleteMarketPostAction(postId: string, formData: FormData) {
  try {
    requireDeleteConfirmation(formData);
    const { post, supabase } = await loadManageablePost(postId);
    const { error } = await supabase.from("market_posts").delete().eq("id", post.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidateMarketPaths(String(post.id));
    redirect(encodeMessage("/mypage", "message", "게시글이 삭제되었습니다."));
  } catch (error) {
    rethrowRedirectError(error);
    redirect(encodeMessage(`/market/${postId}`, "error", toErrorMessage(error)));
  }
}
