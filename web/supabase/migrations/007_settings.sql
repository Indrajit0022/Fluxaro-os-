-- Backs the Settings page: team roster, integration status, and workspace
-- notification preferences. Same RLS pattern as every other table (enabled,
-- no policies, service_role-only). No real OAuth/notification delivery
-- here yet — these are honest manually-maintained records, not live
-- connections; automations get wired up when credentials exist.

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

insert into public.team_members (name, role) values
  ('Ace', 'Founder / CEO'),
  ('Aditya', 'Co-founder');

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  connected boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger integrations_set_updated_at
before update on public.integrations
for each row execute function public.set_updated_at();

alter table public.integrations enable row level security;

insert into public.integrations (name, connected) values
  ('Google Calendar', false),
  ('Slack', false),
  ('Google Drive', false);

-- Singleton row: id is a boolean that must always be true, so Postgres's
-- primary key constraint guarantees exactly one row can ever exist.
create table public.workspace_settings (
  id boolean primary key default true check (id),
  email_alerts boolean not null default true,
  slack_alerts boolean not null default false,
  weekly_digest boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger workspace_settings_set_updated_at
before update on public.workspace_settings
for each row execute function public.set_updated_at();

alter table public.workspace_settings enable row level security;

insert into public.workspace_settings (id) values (true);
