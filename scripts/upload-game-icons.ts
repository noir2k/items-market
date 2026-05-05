import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { parseEnvFile } from "../lib/env-file";
import { getLocalSupabaseConfig } from "../lib/supabase-local";

/**
 * 로컬 public/icons/games/*.png 를 Supabase Storage `game-icons` 버킷으로
 * 업로드하고 games.icon_path 를 갱신한다. 멱등(idempotent) — 반복 실행 안전.
 *
 * 사용:
 *   npm run supabase:upload-icons
 *   npm run supabase:upload-icons -- --env-file=.env.staging
 */

const BUCKET_ID = "game-icons";
const ICONS_DIR = resolve(process.cwd(), "public/icons/games");
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

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

async function ensureBucket(adminClient: any) {
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list storage buckets: ${listError.message}`);
  }

  const existing = (buckets ?? []).find((bucket: { id: string; public: boolean }) => bucket.id === BUCKET_ID);

  if (existing) {
    // 이미 있으면 public 여부만 보정하고 끝낸다.
    if (!existing.public) {
      const { error: updateError } = await adminClient.storage.updateBucket(BUCKET_ID, {
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        fileSizeLimit: 1_048_576,
        public: true
      });

      if (updateError) {
        throw new Error(`Failed to make bucket public: ${updateError.message}`);
      }
    }
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(BUCKET_ID, {
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    fileSizeLimit: 1_048_576,
    public: true
  });

  if (createError) {
    throw new Error(`Failed to create bucket ${BUCKET_ID}: ${createError.message}`);
  }
}

async function uploadIcon(
  adminClient: any,
  fileName: string
) {
  const extension = extname(fileName).toLowerCase();
  const contentType = MIME_BY_EXT[extension];

  if (!contentType) {
    throw new Error(`Unsupported icon extension for ${fileName}`);
  }

  const filePath = resolve(ICONS_DIR, fileName);
  const buffer = readFileSync(filePath);

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET_ID)
    .upload(fileName, buffer, {
      cacheControl: "31536000, immutable",
      contentType,
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload ${fileName}: ${uploadError.message}`);
  }
}

async function syncGameIconPath(
  adminClient: any,
  slug: string,
  iconPath: string
) {
  const { error } = await adminClient
    .from("games")
    .update({ icon_path: iconPath })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to update games.icon_path for slug=${slug}: ${error.message}`);
  }
}

async function main() {
  loadEnvFile();

  if (!existsSync(ICONS_DIR)) {
    throw new Error(`Icons directory not found: ${ICONS_DIR}`);
  }

  const fileNames = readdirSync(ICONS_DIR)
    .filter((name) => ALLOWED_EXTENSIONS.has(extname(name).toLowerCase()))
    .sort();

  if (fileNames.length === 0) {
    console.log(`No icon files in ${ICONS_DIR}; nothing to upload.`);
    return;
  }

  const { serviceRoleKey, supabaseUrl } = getLocalSupabaseConfig();
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`Ensuring bucket "${BUCKET_ID}" exists at ${supabaseUrl}...`);
  await ensureBucket(adminClient);

  console.log(`Uploading ${fileNames.length} icon(s)...`);
  for (const fileName of fileNames) {
    await uploadIcon(adminClient, fileName);
    console.log(`  ✓ ${fileName}`);
  }

  console.log(`Linking icons to games.icon_path...`);
  let linkedCount = 0;
  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.[^.]+$/, "");
    await syncGameIconPath(adminClient, slug, fileName);
    linkedCount += 1;
  }

  console.log(`Done. ${linkedCount} game(s) linked to icons.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
