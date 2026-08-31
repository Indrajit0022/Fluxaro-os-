import { listLeads } from "@/lib/leads";
import { ClientsKanban } from "@/components/ClientsKanban";
import { NewLeadModal } from "@/components/NewLeadModal";
import { isWithinLastDays } from "@/lib/format";

export const dynamic = "force-dynamic";

function monthBuckets(leads: Awaited<ReturnType<typeof listLeads>>) {
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const count = leads.filter((l) => {
      const c = new Date(l.created_at);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }
  return months;
}

export default async function ClientsPage() {
  const leads = await listLeads();

  const months = monthBuckets(leads);
  const maxMonthCount = Math.max(1, ...months.map((m) => m.count));

  const won = leads.filter((l) => l.stage === "won").length;
  const lost = leads.filter((l) => l.stage === "lost").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
  const winDots = Math.round((winRate / 100) * 32);

  const newLeadsCount = leads.filter((l) => l.stage === "new").length;
  const newThisWeek = leads.filter(
    (l) => l.stage === "new" && isWithinLastDays(l.created_at, 7)
  ).length;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Clients</div>
          <div className="mt-1.5 text-sm text-ink/55">Every account and lead in one place</div>
        </div>
        <div className="flex flex-none items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(20,20,20,0.4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[13px] text-ink/40">Search</span>
          </div>
          <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <NewLeadModal
            trigger={
              <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
                + New Client
              </button>
            }
          />
        </div>
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="min-w-0 flex-1 rounded-[20px] bg-white p-[18px]">
          <div className="text-[13px] font-semibold text-ink">New Clients</div>
          <div className="mt-3.5 flex flex-wrap items-baseline gap-1.5">
            <div className="text-[28px] font-bold text-ink">
              {months.reduce((s, m) => s + m.count, 0)}
            </div>
            <div className="whitespace-nowrap text-xs text-ink/50">/ last 6 months</div>
          </div>
          <div className="mt-4 flex h-20 items-end gap-2">
            {months.map((m, i) => (
              <div key={m.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                <div
                  className="w-full rounded-t-lg rounded-b-[3px]"
                  style={{
                    background: i === months.length - 1 ? "#EAF76A" : "#141414",
                    height: `${Math.max(6, (m.count / maxMonthCount) * 100)}%`,
                  }}
                />
                <div className="text-[10px] text-ink/50">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 rounded-[20px] bg-white p-[18px]">
          <div className="text-[13px] font-semibold text-ink">Win Rate</div>
          <div className="mt-3.5 flex flex-wrap items-baseline gap-1.5">
            <div className="text-[28px] font-bold text-ink">{winRate}%</div>
            <div className="whitespace-nowrap text-xs text-ink/50">of closed deals</div>
          </div>
          <div className="mt-4 grid grid-cols-8 gap-1.5">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="aspect-square w-full rounded-full"
                style={{ background: i < winDots ? "#EAF76A" : "#EDEDE6" }}
              />
            ))}
          </div>
        </div>

        <div className="flex w-[200px] flex-none flex-col gap-4">
          <div className="flex min-h-[60px] flex-1 flex-col justify-between rounded-[20px] bg-ink p-[18px]">
            <div className="text-[13px] font-medium text-white/60">Active Clients</div>
            <div className="text-[26px] font-bold text-white">{won}</div>
            <div className="text-[11px] text-white/50">Won deals to date</div>
          </div>
          <div className="flex min-h-[60px] flex-1 flex-col justify-between rounded-[20px] bg-lime p-[18px]">
            <div className="text-[13px] font-medium text-ink/60">New Leads</div>
            <div className="text-[26px] font-bold text-ink">{newLeadsCount}</div>
            <div className="text-[11px] text-ink/55">{newThisWeek} added this week</div>
          </div>
        </div>
      </div>

      <ClientsKanban leads={leads} />
    </>
  );
}
