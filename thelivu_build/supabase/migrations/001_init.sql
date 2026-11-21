-- Thelivu guest-first schema. Apply only to the user's own Supabase project.
-- Do not point this migration at the initialized Manus-managed MySQL database.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null check (scan_type in ('website','message','claim','image','video','security-review')),
  target_reference text not null check (char_length(target_reference) <= 512),
  assessment text not null check (char_length(assessment) <= 80),
  result_summary text not null check (char_length(result_summary) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists scan_history_user_created_idx on public.scan_history(user_id, created_at desc);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_title text not null check (char_length(report_title) between 1 and 200),
  report_data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists saved_reports_user_created_idx on public.saved_reports(user_id, created_at desc);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (char_length(module_id) <= 100),
  completed_at timestamptz not null default now(),
  score integer not null check (score between 0 and 100),
  unique (user_id, module_id)
);
create index if not exists learning_progress_user_module_idx on public.learning_progress(user_id, module_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  message text not null check (char_length(message) <= 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark','light')),
  language text not null default 'en' check (language in ('en','ml','hi')),
  notification_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.scan_history enable row level security;
alter table public.saved_reports enable row level security;
alter table public.learning_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "profiles own record" on public.profiles;
create policy "profiles own record" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "scan history own records" on public.scan_history;
create policy "scan history own records" on public.scan_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "saved reports own records" on public.saved_reports;
create policy "saved reports own records" on public.saved_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "learning progress own records" on public.learning_progress;
create policy "learning progress own records" on public.learning_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "notifications own records" on public.notifications;
create policy "notifications own records" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "preferences own record" on public.user_preferences;
create policy "preferences own record" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
