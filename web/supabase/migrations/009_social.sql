-- Social Media: Fluxaro's own social presence (per the Content SOP), not
-- client social accounts. A small account roster plus a lightweight content
-- calendar — status and pillar options mirror the real Content SOP /
-- Content Pillars already in the Knowledge Base, simplified to four stages
-- instead of the full 12-step pipeline.

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  handle text not null,
  url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.social_accounts enable row level security;

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.social_accounts(id) on delete set null,

  title text not null,
  content text,
  pillar text check (pillar in ('business-thinking', 'systems', 'proof', 'behind-the-scenes', 'offers')),
  status text not null default 'idea' check (status in ('idea', 'drafted', 'scheduled', 'posted')),
  scheduled_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index social_posts_scheduled_date_idx on public.social_posts (scheduled_date);
create index social_posts_account_id_idx on public.social_posts (account_id);

create trigger social_posts_set_updated_at
before update on public.social_posts
for each row execute function public.set_updated_at();

alter table public.social_posts enable row level security;
