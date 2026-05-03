import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnvFile } from "../lib/env-file";
import { getLocalSupabaseConfig } from "../lib/supabase-local";

function loadEnvFile() {
  const requestedPath = process.argv.find((argument) => argument.startsWith("--env-file="))?.split("=")[1];
  const envPath = resolve(process.cwd(), requestedPath || ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const values = parseEnvFile(readFileSync(envPath, "utf8"));

  for (const [key, value] of Object.entries(values)) {
    process.env[key] ||= value;
  }
}

async function main() {
  loadEnvFile();
  const { serviceRoleKey, supabaseUrl } = getLocalSupabaseConfig();
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { error: commentsError } = await adminClient.from("market_comments").delete().neq("id", 0);
  if (commentsError) {
    throw new Error(`Failed to clear market_comments: ${commentsError.message}`);
  }

  const { error: postsError } = await adminClient.from("market_posts").delete().neq("id", 0);
  if (postsError) {
    throw new Error(`Failed to clear market_posts: ${postsError.message}`);
  }

  console.log("Cleared market_posts and market_comments. Re-run `npm run supabase:bootstrap` to reseed demo content.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
