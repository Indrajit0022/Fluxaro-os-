const ACTIONS = [
  { label: "Record Payment", dark: true, icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' },
  { label: "Log Expense", dark: false, icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>' },
  { label: "Send Invoice", dark: false, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' },
  { label: "Payout", dark: false, icon: '<path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>' },
];

const PAYMENTS = [
  { name: "Beacon Health", initial: "B", date: "Aug 25, 2026", status: "Pending", chipBg: "#FFFBEB", chipColor: "#D97706", amount: "+$21,000" },
  { name: "Corven Manufacturing", initial: "C", date: "Aug 22, 2026", status: "Paid", chipBg: "#EAF76A", chipColor: "#141414", amount: "+$34,000" },
  { name: "Solstice Retail", initial: "S", date: "Aug 12, 2026", status: "Paid", chipBg: "#EAF76A", chipColor: "#141414", amount: "+$28,500" },
  { name: "Vantage Legal", initial: "V", date: "Aug 18, 2026", status: "Overdue", chipBg: "#FEE2E2", chipColor: "#DC2626", amount: "+$13,200" },
];

const ACTIVITY = [
  { label: "Beacon Health", sub: "Payment received", time: "11 minutes ago", amount: "+$21,000", color: "#141414", initial: "B" },
  { label: "Corven Mfg", sub: "Invoice sent", time: "32 minutes ago", amount: "$34,000", color: "rgba(20,20,20,0.6)", initial: "C" },
  { label: "Contractor Payout", sub: "Design retainer", time: "1 hour ago", amount: "-$4,200", color: "#DC2626", initial: "P" },
  { label: "Solstice Retail", sub: "Payment received", time: "3 hours ago", amount: "+$28,500", color: "#141414", initial: "S" },
  { label: "Software", sub: "Subscription expense", time: "1 day ago", amount: "-$860", color: "#DC2626", initial: "S" },
];

export default function CashflowPage() {
  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Cashflow</div>
          <div className="mt-1.5 text-sm text-ink/55">Revenue and expenses across active projects</div>
        </div>
        <button className="flex-none whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
          + Add Invoice
        </button>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex min-h-[130px] min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
              <div className="flex items-start justify-between">
                <div className="text-[13px] font-medium text-white/60">Total Revenue</div>
                <div className="font-bold text-white/35">•••</div>
              </div>
              <div className="text-[28px] font-bold text-white">$142,300</div>
              <div className="text-xs text-white/55">3 active projects</div>
            </div>
            <div className="flex min-h-[130px] min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-lime p-5">
              <div className="flex items-start justify-between">
                <div className="text-[13px] font-medium text-ink/60">Outstanding</div>
                <div className="font-bold text-ink/35">•••</div>
              </div>
              <div className="text-[28px] font-bold text-ink">$34,200</div>
              <div className="text-xs text-ink/55">2 invoices pending</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ACTIONS.map((a) => (
              <div
                key={a.label}
                className="flex cursor-pointer items-center gap-2.5 rounded-full py-2 pr-4 pl-2"
                style={{ background: a.dark ? "#141414" : "#fff", color: a.dark ? "#fff" : "#141414" }}
              >
                <div
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
                  style={{ background: a.dark ? "#2a2a2a" : "#F4F3EF" }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${a.dark ? "#EAF76A" : "#141414"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${a.icon}</svg>`,
                  }}
                />
                <div className="whitespace-nowrap text-[13px] font-semibold">{a.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-3.5 text-base font-bold text-ink">Recent Payments</div>
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
              <div>Client</div>
              <div>Date</div>
              <div>Status</div>
              <div className="text-right">Amount</div>
            </div>
            {PAYMENTS.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-t border-divider px-1 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-panel text-xs font-bold text-ink">
                    {row.initial}
                  </div>
                  <div className="text-[13px] font-semibold text-ink">{row.name}</div>
                </div>
                <div className="text-xs text-ink/55">{row.date}</div>
                <div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: row.chipBg, color: row.chipColor }}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="text-right text-[13px] font-semibold text-ink">{row.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-ink">Statistics</div>
              <div className="rounded-full bg-panel px-3 py-1.5 text-[11px] font-medium text-ink">This Month ⌄</div>
            </div>
            <div
              className="relative mx-auto mt-5 h-[150px] w-[150px] rounded-full"
              style={{ background: "conic-gradient(#141414 0deg 273.6deg, #EAF76A 273.6deg 360deg)" }}
            >
              <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white">
                <div className="text-[10px] font-semibold text-ink/50">Total</div>
                <div className="text-lg font-bold text-ink">$142.3K</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink/60">
                  <span className="inline-block h-2 w-2 rounded-full bg-ink" />
                  Client Revenue
                </span>
                <span className="font-semibold text-ink">$108.1K</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink/60">
                  <span className="inline-block h-2 w-2 rounded-full bg-lime" />
                  Retainer Revenue
                </span>
                <span className="font-semibold text-ink">$34.2K</span>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-2.5 text-[15px] font-bold text-ink">Recent Activity</div>
            {ACTIVITY.map((act, i) => (
              <div key={i} className="flex items-center gap-2.5 border-t border-divider py-2.5">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
                  {act.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink">{act.label}</div>
                  <div className="text-[11px] text-ink/50">
                    {act.sub} · {act.time}
                  </div>
                </div>
                <div className="flex-none text-xs font-bold" style={{ color: act.color }}>
                  {act.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
