const METRICS = [
  {
    title: "Proposals Sent",
    value: "6",
    delta: "20%",
    up: true,
    breakdown: [
      { label: "Referral", value: "2", delta: "21%", up: true },
      { label: "Outbound", value: "3", delta: "12%", up: true },
      { label: "Inbound", value: "1", delta: "0%", up: true },
    ],
  },
  {
    title: "Proposals Won",
    value: "3",
    delta: "15%",
    up: true,
    breakdown: [
      { label: "Referral", value: "1", delta: "21%", up: true },
      { label: "Outbound", value: "2", delta: "8%", up: true },
      { label: "Inbound", value: "0", delta: "0%", up: true },
    ],
  },
  {
    title: "Response Rate",
    value: "58%",
    delta: "8%",
    up: true,
    breakdown: [
      { label: "Referral", value: "71%", delta: "12%", up: true },
      { label: "Outbound", value: "48%", delta: "5%", up: true },
      { label: "Inbound", value: "60%", delta: "0%", up: true },
    ],
  },
  {
    title: "Avg Deal Size",
    value: "$36,700",
    delta: "5%",
    up: false,
    breakdown: [
      { label: "Referral", value: "$41,200", delta: "9%", up: true },
      { label: "Outbound", value: "$33,900", delta: "8%", up: false },
      { label: "Inbound", value: "$28,500", delta: "0%", up: true },
    ],
  },
  {
    title: "Pipeline Value",
    value: "$110,300",
    delta: "22%",
    up: true,
    breakdown: [
      { label: "Referral", value: "$42,000", delta: "12%", up: true },
      { label: "Outbound", value: "$68,300", delta: "28%", up: true },
      { label: "Inbound", value: "$0", delta: "0%", up: true },
    ],
  },
  {
    title: "Avg Time to Close",
    value: "18 days",
    delta: "12%",
    up: false,
    breakdown: [
      { label: "Referral", value: "14 days", delta: "18%", up: false },
      { label: "Outbound", value: "22 days", delta: "6%", up: false },
      { label: "Inbound", value: "19 days", delta: "0%", up: true },
    ],
  },
];

export default function ProposalsPage() {
  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Proposals</div>
          <div className="mt-1.5 text-sm text-ink/55">Track everything sent, signed, or stalled</div>
        </div>
        <button className="flex-none whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
          + New Proposal
        </button>
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-[2] flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-lime">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-ink">Quarterly Target</div>
            </div>
            <div className="whitespace-nowrap text-lg font-bold text-ink">
              $110,300 <span className="text-[13px] font-medium text-ink/45">/ $150,000</span>
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-panel">
            <div className="h-full rounded-full bg-lime" style={{ width: "74%" }} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-[18px]">
          <div className="text-[13px] font-medium text-white/60">Proposals Out</div>
          <div className="text-[26px] font-bold text-white">2</div>
          <div className="text-[11px] text-white/50">1 awaiting response</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-[18px]">
          <div className="text-[13px] font-medium text-ink/60">Win Rate</div>
          <div className="text-[26px] font-bold text-ink">58%</div>
          <div className="text-[11px] text-ink/50">Last 6 months</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3.5">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[13px] font-semibold text-ink">This Quarter</span>
          <span className="text-[11px] text-ink/40">⌄</span>
        </div>
        <div className="text-xs text-ink/50">compared to Jun 1 – Aug 31, 2026</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <div key={m.title} className="rounded-[20px] bg-white p-5">
            <div className="text-[13px] font-semibold text-ink underline decoration-ink/25 underline-offset-4">
              {m.title}
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <div className="text-[26px] font-bold text-ink">{m.value}</div>
              <div className="text-xs font-bold" style={{ color: m.up ? "#3B8A3B" : "#DC2626" }}>
                {m.up ? "↑" : "↓"} {m.delta}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {m.breakdown.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center justify-between border-t border-dashed border-[#EDEDE6] pt-2.5 text-xs"
                >
                  <span className="text-ink/55">{b.label}</span>
                  <span className="flex flex-none items-center gap-1.5">
                    <span className="whitespace-nowrap font-semibold text-ink">{b.value}</span>
                    <span
                      className="flex-none whitespace-nowrap text-[11px] font-bold"
                      style={{ color: b.up ? "#3B8A3B" : "#DC2626" }}
                    >
                      {b.up ? "↑" : "↓"} {b.delta}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
