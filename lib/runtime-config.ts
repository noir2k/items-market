const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
] as const;

type RuntimeEnv = Record<string, string | undefined>;

export interface RuntimeValidationResult {
  missing: string[];
  ok: boolean;
}

export function validateRuntimeEnv(env: RuntimeEnv = process.env): RuntimeValidationResult {
  const missing = REQUIRED_PUBLIC_ENV.filter((key) => !env[key]);

  return {
    missing,
    ok: missing.length === 0
  };
}

export function getSupabaseRuntimeConfig(env: RuntimeEnv = process.env): {
  anonKey: string;
  supabaseUrl: string;
} {
  const validation = validateRuntimeEnv(env);

  if (!validation.ok) {
    throw new Error(`Missing required runtime environment variables: ${validation.missing.join(", ")}`);
  }

  return {
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL as string
  };
}

export function getAppBaseUrl(env: RuntimeEnv = process.env): string {
  return env.NEXT_PUBLIC_SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || "http://localhost:3000";
}

export function redactSecret(value: string | undefined): string {
  if (!value || value.length < 12) {
    return "*****";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
