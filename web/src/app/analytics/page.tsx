import { listLeads } from "@/lib/leads";
import { formatCurrency, formatCurrencyFull, initialOf } from "@/lib/format";

export const dynamic = "force-dynamic";

const TABS = ["Overview", "Clients", "Proposals", "Cashflow", "Agents"];

// Illustrative — daily pipeline snapshots aren't tracked yet, so this trend
// stays representative until that history exists (same simplification as
// the Command Center chart).
const GRID_LINES_Y = [0, 50, 100, 150, 200];
function toXY(vals: number[]) {
  return vals.map((v, i) => [(i * 760) / (vals.length - 1), 200 - v * 1.7] as const);
}
function catmullRom2bezier(points: readonly (readonly [number, number])[]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
const valuePts = toXY([30, 42, 38, 55, 48, 70, 62, 80, 74, 90, 85, 100]);
const dealsPts = toXY([50, 45, 60, 40, 58, 50, 65, 55, 70, 60, 75, 68]);
const valueSolidPath = catmullRom2bezier(valuePts.slice(0, -1));
const valueDashedPath = catmullRom2bezier(valuePts.slice(-2));
const dealsPath = catmullRom2bezier(dealsPts);
const topChannelBars = [10, 14, 12, 18, 22, 28, 34, 44];

export default async function AnalyticsPage() {
  const leads = await listLeads();

  const activeDeals = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const pipelineValue = activeDeals.reduce((s, l) => s + (l.deal_value ?? 0), 0);
  const withValue = leads.filter((l) => l.deal_value != null);
  const avgDealSize =
    withValue.length > 0
      ? withValue.reduce((s, l) => s + (l.deal_value ?? 0), 0) / withValue.length
      : 0;

  const won = leads.filter((l) => l.stage === "won").length;
  const lost = leads.filter((l) => l.stage === "lost").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const totalTableValue = leads.reduce((s, l) => s + (l.deal_value ?? 0), 0);
  const table = [...leads]
    .sort((a, b) => (b.deal_value ?? 0) - (a.deal_value ?? 0))
    .map((l, i) => ({
      rank: i + 1,
      lead: l,
      sharePct: totalTableValue > 0 ? ((l.deal_value ?? 0) / totalTableValue) * 100 : 0,
    }));

  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Analytics</div>
        <div className="mt-1.5 text-sm text-ink/55">How the pipeline is performing this quarter</div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <div
            key={t}
            className="rounded-full px-[18px] py-2.5 text-[13px] font-medium"
            style={i === 0 ? { background: "#141414", color: "#fff" } : { background: "#fff", color: "#141414" }}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineValue) },
          { label: "Active Deals", value: String(activeDeals.length) },
          { label: "Avg Deal Size", value: formatCurrency(avgDealSize) },
          { label: "Clients Tracked", value: String(leads.length) },
        ].map((m) => (
          <div key={m.label} className="min-w-0 rounded-[20px] bg-white p-[18px]">
            <div className="flex items-center gap-2">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-ink/55">
                {m.label}
              </div>
              <div className="flex-none rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-semibold text-ink/40">
                live
              </div>
            </div>
            <div className="mt-3 text-[22px] font-bold text-ink">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-bold text-ink">Deal Volume Timeseries</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink">All Stages ⌄</div>
          <div className="rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink">All Channels ⌄</div>
          <div className="rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-white">365D ⌄</div>
        </div>
      </div>

      <div className="relative mt-3.5 min-h-[280px] rounded-[20px] bg-ink p-6">
        <div className="flex items-center gap-3.5 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-lime" />
            Pipeline Value
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-white/50" />
            Deals
          </span>
        </div>
        <svg viewBox="0 0 760 200" className="mt-2.5 block h-[200px] w-full" preserveAspectRatio="none">
          {GRID_LINES_Y.map((gy) => (
            <line key={gy} x1="0" y1={gy} x2="760" y2={gy} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          <path d={dealsPath} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="5 5" />
          <path d={valueSolidPath} fill="none" stroke="#EAF76A" strokeWidth="2.5" />
          <path d={valueDashedPath} fill="none" stroke="#EAF76A" strokeWidth="2.5" strokeDasharray="5 5" />
          {valuePts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#141414" stroke="#EAF76A" strokeWidth="2" />
          ))}
        </svg>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/40">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
        </div>

        <div className="absolute top-5 right-5 w-[150px] rounded-2xl bg-white p-3.5">
          <div className="text-[11px] font-semibold text-ink/50">Win Rate</div>
          <div className="mt-1 text-[22px] font-bold text-ink">{winRate}%</div>
          <div className="mt-0.5 text-[11px] font-semibold text-[#3B8A3B]">from real pipeline</div>
        </div>

        <div className="absolute bottom-5 right-5 w-[170px] rounded-2xl bg-white p-3.5">
          <div className="text-[11px] font-semibold text-ink">Top Channel: Referral</div>
          <div className="mt-2.5 flex h-11 items-end gap-[3px]">
            {topChannelBars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[3px] bg-lime" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-white px-5 py-2">
        <div className="grid grid-cols-[28px_1.6fr_1.3fr_1fr_0.7fr_0.9fr] px-1 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          <div>#</div>
          <div>Client</div>
          <div>Market Share</div>
          <div>Pipeline</div>
          <div>Stage</div>
          <div>Status</div>
        </div>
        {table.map((row) => (
          <div
            key={row.lead.id}
            className="grid grid-cols-[28px_1.6fr_1.3fr_1fr_0.7fr_0.9fr] items-center border-t border-divider px-1 py-3"
          >
            <div className="text-xs text-ink/45">{row.rank}</div>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
                {initialOf(row.lead.company)}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink">
                {row.lead.company}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 flex-none text-xs font-semibold text-ink">
                {row.sharePct.toFixed(1)}%
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F1EC]">
                <div className="h-full rounded-full bg-lime" style={{ width: `${row.sharePct}%` }} />
              </div>
            </div>
            <div className="text-[13px] text-ink/70">{formatCurrencyFull(row.lead.deal_value)}</div>
            <div className="text-[13px] text-ink/70">{row.lead.stage.replace("_", " ")}</div>
            <div className="text-[13px] font-semibold text-ink">
              {row.lead.stage === "won" ? "Won" : row.lead.stage === "lost" ? "Lost" : "Open"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
