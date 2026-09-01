import { listLeadsWithFollowUp } from "@/lib/leads";
import { FollowUpsList } from "@/components/FollowUpsList";
import { daysUntil } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const leads = await listLeadsWithFollowUp();

  const overdue = leads.filter((l) => l.follow_up_date && daysUntil(l.follow_up_date) < 0).length;
  const dueToday = leads.filter((l) => l.follow_up_date && daysUntil(l.follow_up_date) === 0).length;
  const upcoming = leads.filter((l) => l.follow_up_date && daysUntil(l.follow_up_date) > 0).length;

  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Follow-ups</div>
        <div className="mt-1.5 text-sm text-ink/55">Leads with a scheduled call-back or check-in</div>
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
          <div className="text-[13px] font-medium text-white/60">Overdue</div>
          <div className="text-[26px] font-bold text-white">{overdue}</div>
          <div className="text-[11px] text-white/50">Past their follow-up date</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Due Today</div>
          <div className="text-[26px] font-bold text-ink">{dueToday}</div>
          <div className="text-[11px] text-ink/50">Follow up before end of day</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Upcoming</div>
          <div className="text-[26px] font-bold text-ink">{upcoming}</div>
          <div className="text-[11px] text-ink/50">Scheduled for later</div>
        </div>
      </div>

      <FollowUpsList leads={leads} />
    </>
  );
}
