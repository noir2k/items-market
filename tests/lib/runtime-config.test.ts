import { describe, expect, it } from "vitest";
import {
  getAppBaseUrl,
  getSupabaseRuntimeConfig,
  redactSecret,
  validateRuntimeEnv
} from "../../lib/runtime-config";

describe("validateRuntimeEnv", () => {
  it("reports missing required staging variables", () => {
    const result = validateRuntimeEnv({});

    expect(result.ok).toBe(false);
    expect(result.missing).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ]);
  });

  it("accepts a minimal public runtime configuration", () => {
    const result = validateRuntimeEnv({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co"
    });

    expect(result).toEqual({
      missing: [],
      ok: true
    });
  });
});

describe("getSupabaseRuntimeConfig", () => {
  it("throws a readable error when config is incomplete", () => {
    expect(() => getSupabaseRuntimeConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" })).toThrow(
      "Missing required runtime environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  });

  it("returns the runtime config when all required values exist", () => {
    expect(
      getSupabaseRuntimeConfig({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co"
      })
    ).toEqual({
      anonKey: "anon-key",
      supabaseUrl: "https://project.supabase.co"
    });
  });
});

describe("getAppBaseUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and falls back to localhost", () => {
    expect(getAppBaseUrl({ NEXT_PUBLIC_SITE_URL: "https://staging.example.com" })).toBe("https://staging.example.com");
    expect(getAppBaseUrl({})).toBe("http://localhost:3000");
  });
});

describe("redactSecret", () => {
  it("keeps only the edge of a secret visible", () => {
    expect(redactSecret("abcdefghijklmnopqrstuvwxyz")).toBe("abcd...wxyz");
    expect(redactSecret("short")).toBe("*****");
  });
});
