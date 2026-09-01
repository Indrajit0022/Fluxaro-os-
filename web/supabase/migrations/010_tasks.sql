-- Daily Tasks: a simple shared, date-based work log for the two-person
-- team. Two parts per person per day:
--  1. A shared set of recurring yes/no checklist items (defined once,
--     toggled independently by each person for each date).
--  2. Free-typed task entries, each with a done/not-done toggle.
-- "member" is a fixed two-value enum (not a foreign key to team_members,
-- which is just an editable display roster) since this feature is
-- specifically Indrajit & Aditya's shared daily log.

create table public.daily_checklist_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  created_at timestamptz not null default now()
);

alter table public.daily_checklist_items enable row level security;

create table public.daily_checklist_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.daily_checklist_items(id) on delete cascade,
  member text not null check (member in ('indrajit', 'aditya')),
  date date not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),

  unique (item_id, member, date)
);

create index daily_checklist_entries_date_idx on public.daily_checklist_entries (date);

create trigger daily_checklist_entries_set_updated_at
before update on public.daily_checklist_entries
for each row execute function public.set_updated_at();

alter table public.daily_checklist_entries enable row level security;

create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  member text not null check (member in ('indrajit', 'aditya')),
  date date not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index daily_tasks_date_idx on public.daily_tasks (date);

alter table public.daily_tasks enable row level security;
