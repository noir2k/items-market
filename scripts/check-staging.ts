import { checkStagingHealth } from "../lib/staging-health";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnvFile } from "../lib/env-file";

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
  const health = await checkStagingHealth();

  console.log(JSON.stringify(health, null, 2));

  if (!health.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
