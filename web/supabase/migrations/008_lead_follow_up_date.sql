-- Follow-ups: a simple due-date on a lead for "call/email them back by X".
-- Surfaced on a dedicated /follow-ups page (leads with a date set, sorted
-- soonest first, overdue ones flagged) and settable from the lead detail
-- view. No separate table needed — this rides on the existing leads row.

alter table public.leads add column follow_up_date date;

create index leads_follow_up_date_idx on public.leads (follow_up_date)
where follow_up_date is not null;
