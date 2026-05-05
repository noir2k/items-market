"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPostLoginPath, isAdminProfile, sanitizeRedirectPath } from "../../lib/auth-utils";
import { createClient } from "../../lib/supabase/server";
import type { Profile } from "../../lib/types";

async function loadProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, status")
    .eq("id", userId)
    .single();

  return (profile as Profile | null) ?? null;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const nextPath = sanitizeRedirectPath(String(formData.get("next") || ""));
  const isAdminLogin = String(formData.get("mode") || "") === "admin";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    const target = isAdminLogin ? "/staff/login" : "/login";
    redirect(`${target}?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = user ? await loadProfile(supabase, user.id) : null;

  if (isAdminLogin && !isAdminProfile(profile)) {
    await supabase.auth.signOut();
    redirect("/staff/login?error=" + encodeURIComponent("관리자 계정으로만 접근할 수 있습니다."));
  }

  revalidatePath("/", "layout");
  redirect(getPostLoginPath({ isAdminLogin, nextPath, profile }));
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname
      }
    }
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/login?message=" + encodeURIComponent("회원가입이 완료되었습니다. 로그인해 주세요."));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
