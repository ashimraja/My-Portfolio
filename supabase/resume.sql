-- Resume builder storage. Run once in Supabase → SQL Editor (after schema.sql).
-- Replace every  you@example.com  with the same admin email you used in schema.sql.
-- Resumes are private: unlike the website content, only the admin can read them.

create table if not exists public.resumes (
  id         text primary key,
  name       text        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);
alter table public.resumes enable row level security;

drop policy if exists "resumes: admin only" on public.resumes;
create policy "resumes: admin only" on public.resumes for all to authenticated
  using      ((auth.jwt() ->> 'email') = 'you@example.com')
  with check ((auth.jwt() ->> 'email') = 'you@example.com');
