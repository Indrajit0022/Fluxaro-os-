-- Growth Gap audit (5 pillars, 1-10, evidence-typed per Fluxaro's SOP) and
-- the Proposal System (real OS + pricing catalog lives in app code, not the
-- DB, since it's Fluxaro's fixed product catalog rather than per-record data).

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,

  demand_score smallint check (demand_score between 1 and 10),
  demand_evidence_type text check (demand_evidence_type in ('verified','reported','inferred','unknown')),
  demand_evidence text,

  revenue_score smallint check (revenue_score between 1 and 10),
  revenue_evidence_type text check (revenue_evidence_type in ('verified','reported','inferred','unknown')),
  revenue_evidence text,

  operations_score smallint check (operations_score between 1 and 10),
  operations_evidence_type text check (operations_evidence_type in ('verified','reported','inferred','unknown')),
  operations_evidence text,

  customer_score smallint check (customer_score between 1 and 10),
  customer_evidence_type text check (customer_evidence_type in ('verified','reported','inferred','unknown')),
  customer_evidence text,

  intelligence_score smallint check (intelligence_score between 1 and 10),
  intelligence_evidence_type text check (intelligence_evidence_type in ('verified','reported','inferred','unknown')),
  intelligence_evidence text,

  -- Primary bottleneck = highest BUSINESS IMPACT pillar, not necessarily the
  -- lowest score (per Fluxaro's Growth Gap Audit SOP).
  primary_bottleneck text check (primary_bottleneck in ('demand','revenue','operations','customer','intelligence')),
  business_impact text,
  notes text,

  created_at timestamptz not null default now()
);

create index audits_lead_id_idx on public.audits (lead_id, created_at desc);
alter table public.audits enable row level security;

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  audit_id uuid references public.audits(id) on delete set null,

  -- draft -> approved (human sign-off, required before send) -> sent -> won/lost
  status text not null default 'draft' check (status in ('draft','approved','sent','won','lost')),
  recommended_os text[] not null default '{}',
  tier text check (tier in ('starter','growth','enterprise')),
  price numeric(12,2),

  executive_summary text,
  scope_notes text,
  exclusions text,
  timeline_weeks_min smallint,
  timeline_weeks_max smallint,

  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index proposals_lead_id_idx on public.proposals (lead_id, created_at desc);

create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;
