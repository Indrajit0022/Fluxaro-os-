-- Knowledge Base: a simple, manually-maintained library of SOPs, templates,
-- reference docs, and client notes. Deliberately plain text/markdown storage,
-- no file uploads or search integrations yet — those come later when we
-- connect other apps (Notion, Docs, etc).

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  category text not null check (category in ('sop', 'template', 'reference', 'client-notes')),
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_documents_category_idx on public.knowledge_documents (category, created_at desc);

create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row execute function public.set_updated_at();

-- Same pattern as every other table: RLS enabled, no policies. Only the
-- service_role key (server-side only) can read/write.
alter table public.knowledge_documents enable row level security;
