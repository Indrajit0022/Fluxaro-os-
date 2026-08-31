-- Cashflow & Revenue Tracker, per the original spec: a simple, fast manual
-- log of who paid Fluxaro, how much, when, for what, and on which
-- invoice/milestone. Not connected to Stripe automatically.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,

  project text,
  milestone text,
  amount numeric(12,2) not null,
  method text,
  status text not null default 'pending' check (status in ('pending', 'received', 'overdue')),
  date_received date,
  expected_date date,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_lead_id_idx on public.payments (lead_id, created_at desc);
create index payments_status_idx on public.payments (status);

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- Same pattern as every other table: RLS enabled, no policies. Only the
-- service_role key (server-side only) can read/write.
alter table public.payments enable row level security;
