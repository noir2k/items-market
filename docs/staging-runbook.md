# Staging Runbook

## Purpose

This project is no longer a static mock-only MVP. The staging path runs the Next.js app against Supabase Auth and Postgres with real market posts, comments, member profiles, admin moderation, and CSV export.

## Local Staging

1. Start Supabase:

```powershell
supabase start
```

2. Reset and seed the database:

```powershell
supabase db reset --local
supabase status -o env
```

3. Copy the local keys into `.env.local` using `.env.local.example` as the shape.

4. Create demo auth users and seeded posts/comments:

```powershell
npm run supabase:bootstrap
```

5. Validate the runtime:

```powershell
npm run staging:check
```

6. Build and run:

```powershell
npm run build
npm run start
```

The health endpoint is available at `/api/health`.

## Hosted Staging

Use `.env.staging.example` as the deployment environment shape:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
NEXT_PUBLIC_SITE_URL=https://<staging-domain>
```

Apply database migrations to the staging Supabase project before deploying the app:

```powershell
supabase db push --linked
```

Seed production-like games through `supabase/seed.sql` or an admin SQL console. Demo auth users should only be created in disposable staging environments.

## Validation Checklist

- `npm run test`
- `npm run build`
- `npm run staging:check -- --env-file=.env.staging`
- `GET /api/health` returns HTTP 200
- Login works for a member account
- `/sell` or `/buy` creates a post
- Detail page allows comments while a post is open
- Author or admin can close a trade
- Admin can view members, moderate posts, and export member posts as CSV

## Demo Accounts

Local bootstrap creates:

- `admin@itemmarket.local / admin1234!`
- `seller1@itemmarket.local / seller1234!`
- `buyer1@itemmarket.local / buyer1234!`
