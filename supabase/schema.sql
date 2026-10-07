-- Run this once in Supabase → SQL Editor.
-- BEFORE running: replace every  you@example.com  below with the email of the admin user you create in Authentication → Users (find & replace).

-- ───────────────────────── content (one row per section of the site) ─────────────────────────
create table if not exists public.content (
  key        text primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);
alter table public.content enable row level security;

drop policy if exists "content: public read" on public.content;
create policy "content: public read" on public.content for select using (true);

drop policy if exists "content: admin write" on public.content;
create policy "content: admin write" on public.content for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');

-- ───────────────────────── messages (contact form inbox) ─────────────────────────
create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name)    between 1 and 200),
  email      text not null check (char_length(email)   between 3 and 200),
  company    text          check (char_length(company) <= 200),
  project    text          check (char_length(project) <= 400),
  message    text not null check (char_length(message) between 1 and 5000),
  read       boolean not null default false
);
alter table public.messages enable row level security;

drop policy if exists "messages: anyone can send" on public.messages;
create policy "messages: anyone can send" on public.messages for insert to anon, authenticated with check (true);

drop policy if exists "messages: admin manage" on public.messages;
create policy "messages: admin manage" on public.messages for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');

-- ───────────────────────── image storage (public bucket) ─────────────────────────
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "storage: public read" on storage.objects;
create policy "storage: public read" on storage.objects for select using (bucket_id = 'portfolio');

drop policy if exists "storage: admin write" on storage.objects;
create policy "storage: admin write" on storage.objects for all to authenticated
  using      (bucket_id = 'portfolio' and (auth.jwt() ->> 'email') = 'you@example.com')
  with check (bucket_id = 'portfolio' and (auth.jwt() ->> 'email') = 'you@example.com');

-- ───────────────────────── events (anonymous visitor analytics) ─────────────────────────
-- No IP addresses, no cookies: a random id per browser and one per visit. Anyone may add rows; only the admin can read or delete them.
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor    text not null check (char_length(visitor) <= 64),
  session    text not null check (char_length(session) <= 64),
  type       text not null check (type in ('pageview','project_click','store_click','outbound','resume_download','contact','section')),
  path       text check (char_length(path)     <= 300),
  target     text check (char_length(target)   <= 200),
  referrer   text check (char_length(referrer) <= 200),
  source     text check (char_length(source)   <= 100),
  device     text check (char_length(device)   <= 20),
  browser    text check (char_length(browser)  <= 30),
  tz         text check (char_length(tz)       <= 60)
);
create index if not exists events_created_at_idx on public.events (created_at desc);
alter table public.events enable row level security;

drop policy if exists "events: anyone can add" on public.events;
create policy "events: anyone can add" on public.events for insert to anon, authenticated with check (true);

drop policy if exists "events: admin manage" on public.events;
create policy "events: admin manage" on public.events for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');
