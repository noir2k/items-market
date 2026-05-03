import { createClient } from "@supabase/supabase-js";
import { getSupabaseRuntimeConfig, redactSecret, validateRuntimeEnv } from "./runtime-config";

export interface StagingHealthResult {
  checks: {
    database: boolean;
    env: boolean;
  };
  details: {
    anonKey: string;
    games: number;
    missingEnv: string[];
    posts: number;
    profiles?: number;
    supabaseUrl: string;
  };
  ok: boolean;
}

export async function checkStagingHealth(env: Record<string, string | undefined> = process.env): Promise<StagingHealthResult> {
  const envValidation = validateRuntimeEnv(env);

  if (!envValidation.ok) {
    return {
      checks: {
        database: false,
        env: false
      },
      details: {
        anonKey: redactSecret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        games: 0,
        missingEnv: envValidation.missing,
        posts: 0,
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL || ""
      },
      ok: false
    };
  }

  const { anonKey, supabaseUrl } = getSupabaseRuntimeConfig(env);
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const [gamesResult, postsResult] = await Promise.all([
    supabase.from("games").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("market_posts").select("id", { count: "exact", head: true })
  ]);

  const databaseOk = !gamesResult.error && !postsResult.error;

  return {
    checks: {
      database: databaseOk,
      env: true
    },
    details: {
      anonKey: redactSecret(anonKey),
      games: gamesResult.count ?? 0,
      missingEnv: [],
      posts: postsResult.count ?? 0,
      supabaseUrl
    },
    ok: databaseOk
  };
}
