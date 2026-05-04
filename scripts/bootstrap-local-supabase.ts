import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnvFile } from "../lib/env-file";
import { buildDemoMarketSeed, getLocalSupabaseConfig } from "../lib/supabase-local";

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

type DemoSeed = ReturnType<typeof buildDemoMarketSeed>;

async function ensureUser(adminClient: any, userSeed: DemoSeed["users"][number]) {
  const { data: usersPage, error: listError } = await adminClient.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Failed to list auth users: ${listError.message}`);
  }

  const existingUser = (usersPage?.users ?? []).find(
    (user: { email?: string; id: string }) => user.email === userSeed.email
  );

  if (existingUser) {
    const { error: updateUserError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password: userSeed.password,
      user_metadata: { nickname: userSeed.nickname }
    });

    if (updateUserError) {
      throw new Error(`Failed to update auth user ${userSeed.email}: ${updateUserError.message}`);
    }

    return existingUser.id;
  }

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: userSeed.email,
    email_confirm: true,
    password: userSeed.password,
    user_metadata: { nickname: userSeed.nickname }
  });

  if (createUserError) {
    throw new Error(`Failed to create auth user ${userSeed.email}: ${createUserError.message}`);
  }

  return createdUser.user.id;
}

async function main() {
  loadEnvFile();
  const { serviceRoleKey, supabaseUrl } = getLocalSupabaseConfig();
  const seed = buildDemoMarketSeed();
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const userIdsByEmail: Record<string, string> = {};

  for (const userSeed of seed.users) {
    const userId = await ensureUser(adminClient, userSeed);
    userIdsByEmail[userSeed.email] = userId;

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        nickname: userSeed.nickname,
        role: userSeed.role,
        status: "active"
      })
      .eq("id", userId);

    if (profileError) {
      throw new Error(`Failed to upsert profile for ${userSeed.email}: ${profileError.message}`);
    }
  }

  const { data: games, error: gamesError } = await adminClient.from("games").select("id, slug");

  if (gamesError) {
    throw new Error(`Failed to load seeded games: ${gamesError.message}`);
  }

  const gameIdBySlug = Object.fromEntries(games.map((game) => [game.slug, game.id]));

  // 거래완료 게시글에 timeline의 "거래완료" 단계가 timestamp를 가질 수 있도록
  // closed_at + closed_by(관리자)를 시뮬레이션. 진짜 운영에서는 server action이 채움.
  const adminUserId = userIdsByEmail["admin@itemmarket.local"];
  const seededClosedAt = new Date().toISOString();

  for (const postSeed of seed.posts) {
    const isClosed = postSeed.status === "closed";
    const postPayload: Record<string, unknown> = {
      author_id: userIdsByEmail[postSeed.authorEmail],
      category: postSeed.category,
      content: postSeed.content,
      game_id: gameIdBySlug[postSeed.gameSlug],
      price: postSeed.price,
      price_label: postSeed.priceLabel,
      quantity_description: postSeed.quantityDescription,
      seed_key: postSeed.seedKey,
      server_name: postSeed.serverName,
      status: postSeed.status,
      title: postSeed.title,
      trade_type: postSeed.tradeType,
      view_count: postSeed.viewCount,
      closed_at: isClosed ? seededClosedAt : null,
      closed_by: isClosed ? adminUserId ?? null : null
    };

    const { error: postError } = await adminClient
      .from("market_posts")
      .upsert(postPayload, { onConflict: "seed_key" });

    if (postError) {
      throw new Error(`Failed to upsert post ${postSeed.seedKey}: ${postError.message}`);
    }
  }

  const { data: posts, error: postsError } = await adminClient.from("market_posts").select("id, seed_key");

  if (postsError) {
    throw new Error(`Failed to load posts after upsert: ${postsError.message}`);
  }

  const postIdBySeedKey = Object.fromEntries(posts.map((post) => [post.seed_key, post.id]));

  for (const commentSeed of seed.comments) {
    const commentPayload = {
      author_id: userIdsByEmail[commentSeed.authorEmail],
      comment_type: commentSeed.type,
      content: commentSeed.content,
      post_id: postIdBySeedKey[commentSeed.postSeedKey],
      seed_key: commentSeed.seedKey
    };

    const { error: commentError } = await adminClient
      .from("market_comments")
      .upsert(commentPayload, { onConflict: "seed_key" });

    if (commentError) {
      throw new Error(`Failed to upsert comment ${commentSeed.seedKey}: ${commentError.message}`);
    }
  }

  console.log("Local Supabase bootstrap completed.");
  console.log("Created/updated users:");

  for (const userSeed of seed.users) {
    console.log(`- ${userSeed.email} (${userSeed.role}) / password: ${userSeed.password}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
