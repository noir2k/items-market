create extension if not exists pgcrypto;

create type public.app_role as enum ('member', 'admin');
create type public.member_status as enum ('active', 'suspended');
create type public.market_trade_type as enum ('buy', 'sell');
create type public.market_post_status as enum ('open', 'closed');
create type public.market_category as enum ('game_money', 'item', 'account', 'etc');
create type public.market_comment_type as enum ('inquiry', 'offer', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nickname text not null unique,
  role public.app_role not null default 'member',
  status public.member_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_nickname_length check (char_length(nickname) between 3 and 32)
);

create table public.games (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.market_posts (
  id bigint generated always as identity primary key,
  seed_key text unique,
  author_id uuid not null references public.profiles(id) on delete cascade,
  game_id bigint not null references public.games(id) on delete restrict,
  trade_type public.market_trade_type not null,
  category public.market_category not null,
  status public.market_post_status not null default 'open',
  title text not null,
  content text not null,
  server_name text not null,
  price numeric(12, 0),
  price_label text not null default '협의',
  quantity_description text not null,
  contact_open boolean not null default true,
  view_count integer not null default 0,
  closed_at timestamptz,
  closed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint market_posts_title_length check (char_length(title) between 5 and 120),
  constraint market_posts_content_length check (char_length(content) between 10 and 5000),
  constraint market_posts_quantity_length check (char_length(quantity_description) between 2 and 120),
  constraint market_posts_price_presence check (
    (price is null and price_label is not null)
    or (price is not null)
  )
);

create table public.market_comments (
  id bigint generated always as identity primary key,
  seed_key text unique,
  post_id bigint not null references public.market_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  comment_type public.market_comment_type not null default 'inquiry',
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint market_comments_content_length check (char_length(content) between 2 and 2000)
);

create index market_posts_author_id_idx on public.market_posts (author_id);
create index market_posts_game_id_idx on public.market_posts (game_id);
create index market_posts_trade_type_idx on public.market_posts (trade_type);
create index market_posts_status_idx on public.market_posts (status);
create index market_posts_created_at_idx on public.market_posts (created_at desc);
create index market_comments_post_id_idx on public.market_comments (post_id);
create index market_comments_author_id_idx on public.market_comments (author_id);
create index market_comments_created_at_idx on public.market_comments (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nickname_source text;
  normalized_nickname text;
begin
  nickname_source := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'user'
  );

  normalized_nickname := regexp_replace(nickname_source, '[^0-9A-Za-z가-힣_]+', '', 'g');

  if normalized_nickname = '' then
    normalized_nickname := 'user';
  end if;

  insert into public.profiles (
    id,
    email,
    nickname
  )
  values (
    new.id,
    coalesce(new.email, ''),
    left(normalized_nickname, 24) || '_' || right(new.id::text, 6)
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create trigger on_profiles_updated
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger on_market_posts_updated
before update on public.market_posts
for each row
execute function public.set_updated_at();

create trigger on_market_comments_updated
before update on public.market_comments
for each row
execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.market_posts enable row level security;
alter table public.market_comments enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.games to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.market_posts to anon, authenticated;
grant select on public.market_comments to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.market_posts to authenticated;
grant insert, update, delete on public.market_comments to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

create policy "games are readable by everyone"
on public.games
for select
using (true);

create policy "service role can manage games"
on public.games
for all
to service_role
using (true)
with check (true);

create policy "authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "service role can manage profiles"
on public.profiles
for all
to service_role
using (true)
with check (true);

create policy "profile owners or admins can update"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "market posts are readable by everyone"
on public.market_posts
for select
using (true);

create policy "service role can manage market posts"
on public.market_posts
for all
to service_role
using (true)
with check (true);

create policy "authenticated active users can create posts"
on public.market_posts
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
  )
);

create policy "authors and admins can update posts"
on public.market_posts
for update
to authenticated
using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

create policy "authors and admins can delete posts"
on public.market_posts
for delete
to authenticated
using (auth.uid() = author_id or public.is_admin());

create policy "market comments are readable by everyone"
on public.market_comments
for select
using (true);

create policy "service role can manage market comments"
on public.market_comments
for all
to service_role
using (true)
with check (true);

create policy "authenticated active users can create comments"
on public.market_comments
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
  )
);

create policy "comment authors and admins can update comments"
on public.market_comments
for update
to authenticated
using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

create policy "comment authors and admins can delete comments"
on public.market_comments
for delete
to authenticated
using (auth.uid() = author_id or public.is_admin());
