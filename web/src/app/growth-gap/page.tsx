import { listAudits } from "@/lib/audits";
import { listLeads } from "@/lib/leads";
import { AuditModal } from "@/components/AuditModal";
import { GrowthGapList } from "@/components/GrowthGapList";
import { PILLAR_LABELS, type Pillar } from "@/lib/operating-systems";

export const dynamic = "force-dynamic";

export default async function GrowthGapPage() {
  const [audits, leads] = await Promise.all([listAudits(), listLeads()]);
  const companyByLeadId = Object.fromEntries(leads.map((l) => [l.id, l.company]));

  const auditedLeadIds = new Set(audits.map((a) => a.lead_id));
  const bottleneckCounts = audits.reduce<Record<string, number>>((acc, a) => {
    if (a.primary_bottleneck) acc[a.primary_bottleneck] = (acc[a.primary_bottleneck] ?? 0) + 1;
    return acc;
  }, {});
  const topBottleneck = (Object.entries(bottleneckCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    null) as Pillar | null;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Growth Gap</div>
          <div className="mt-1.5 text-sm text-ink/55">
            Five-pillar diagnosis — Demand, Revenue, Operations, Customer, Intelligence
          </div>
        </div>
        <AuditModal
          trigger={
            <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
              + New Audit
            </button>
          }
        />
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Leads Audited</div>
          <div className="text-[26px] font-bold text-ink">
            {auditedLeadIds.size} / {leads.length}
          </div>
          <div className="text-[11px] text-ink/50">Have at least one audit on file</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
          <div className="text-[13px] font-medium text-white/60">Total Audits</div>
          <div className="text-[26px] font-bold text-white">{audits.length}</div>
          <div className="text-[11px] text-white/50">Across all leads</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Most Common Bottleneck</div>
          <div className="text-[26px] font-bold text-ink">
            {topBottleneck ? PILLAR_LABELS[topBottleneck] : "—"}
          </div>
          <div className="text-[11px] text-ink/50">Across audited leads</div>
        </div>
      </div>

      <GrowthGapList audits={audits} companyByLeadId={companyByLeadId} />
    </>
  );
}
