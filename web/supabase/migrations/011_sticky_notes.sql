-- Sticky notes: short messages Indrajit and Aditya leave each other,
-- shown via a small floating widget on the Command Center only.

create table public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('indrajit', 'aditya')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.sticky_notes enable row level security;
