import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../lib/env-file";

describe("parseEnvFile", () => {
  it("parses simple dotenv files and ignores comments", () => {
    expect(
      parseEnvFile(`
# local env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EMPTY=
`)
    ).toEqual({
      EMPTY: "",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321"
    });
  });
});
