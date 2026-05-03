import { describe, expect, it } from "vitest";
import {
  buildDemoMarketSeed,
  getLocalSupabaseConfig
} from "../../lib/supabase-local";

describe("getLocalSupabaseConfig", () => {
  it("uses the local API url by default and requires a service role key", () => {
    expect(() => getLocalSupabaseConfig({})).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("prefers explicit environment overrides", () => {
    const config = getLocalSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key"
    });

    expect(config).toEqual({
      anonKey: "anon-key",
      serviceRoleKey: "service-role-key",
      supabaseUrl: "http://localhost:54321"
    });
  });
});

describe("buildDemoMarketSeed", () => {
  it("returns admin/member users plus seeded posts and comments", () => {
    const seed = buildDemoMarketSeed();

    expect(seed.users.some((user) => user.role === "admin")).toBe(true);
    expect(seed.posts.length).toBeGreaterThanOrEqual(3);
    expect(seed.comments.length).toBeGreaterThanOrEqual(3);
    expect(seed.posts.every((post) => typeof post.seedKey === "string")).toBe(true);
  });
});
