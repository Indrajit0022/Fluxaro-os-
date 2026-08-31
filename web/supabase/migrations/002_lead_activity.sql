-- Activity log for leads: powers the detail view's history feed and gives
-- us a lightweight audit trail (who/what changed, when) without a full
-- permissions/audit system.

create table public.lead_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (type in ('created', 'stage_change', 'updated', 'note')),
  detail text not null,
  created_at timestamptz not null default now()
);

create index lead_activity_lead_id_idx on public.lead_activity (lead_id, created_at desc);

-- Same pattern as `leads`: RLS enabled, no policies. Only the service_role
-- key (server-side only, never shipped to the browser) can read/write.
alter table public.lead_activity enable row level security;
