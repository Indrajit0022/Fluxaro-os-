-- The Supabase performance advisor flagged proposals.audit_id as an
-- unindexed foreign key (used when linking a proposal back to the audit
-- that produced it, and scanned on any audit delete/update cascade check).
create index proposals_audit_id_idx on public.proposals (audit_id);
