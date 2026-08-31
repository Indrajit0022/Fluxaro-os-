import { listPayments } from "@/lib/payments";
import { listLeads } from "@/lib/leads";
import { formatCurrency, formatCurrencyFull } from "@/lib/format";
import { NewPaymentModal } from "@/components/NewPaymentModal";
import { PaymentsList } from "@/components/PaymentsList";

export const dynamic = "force-dynamic";

function inRange(dateStr: string | null, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= start && d < end;
}

export default async function CashflowPage() {
  const [payments, leads] = await Promise.all([listPayments(), listLeads()]);
  const companyByLeadId = Object.fromEntries(leads.map((l) => [l.id, l.company]));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
  const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 1);

  const received = payments.filter((p) => p.status === "received");
  const revenueThisMonth = received
    .filter((p) => inRange(p.date_received, monthStart, monthEnd))
    .reduce((sum, p) => sum + p.amount, 0);
  const revenueThisQuarter = received
    .filter((p) => inRange(p.date_received, quarterStart, quarterEnd))
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingCount = payments.filter((p) => p.status === "pending" || p.status === "overdue").length;

  const revenueByClient = new Map<string, number>();
  const revenueByProject = new Map<string, number>();
  for (const p of received) {
    const company = companyByLeadId[p.lead_id] ?? "Unknown";
    revenueByClient.set(company, (revenueByClient.get(company) ?? 0) + p.amount);
    const project = p.project || "Unspecified";
    revenueByProject.set(project, (revenueByProject.get(project) ?? 0) + p.amount);
  }
  const topClients = [...revenueByClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topProjects = [...revenueByProject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxClientRevenue = Math.max(1, ...topClients.map(([, v]) => v));
  const maxProjectRevenue = Math.max(1, ...topProjects.map(([, v]) => v));

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Cashflow</div>
          <div className="mt-1.5 text-sm text-ink/55">Every payment we&apos;ve received, and what&apos;s still owed</div>
        </div>
        <NewPaymentModal
          trigger={
            <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
              + Record Payment
            </button>
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex min-h-[130px] min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
              <div className="text-[13px] font-medium text-white/60">This Month</div>
              <div className="text-[28px] font-bold text-white">{formatCurrency(revenueThisMonth)}</div>
              <div className="text-xs text-white/55">Received revenue</div>
            </div>
            <div className="flex min-h-[130px] min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
              <div className="text-[13px] font-medium text-ink/60">This Quarter</div>
              <div className="text-[28px] font-bold text-ink">{formatCurrency(revenueThisQuarter)}</div>
              <div className="text-xs text-ink/50">Received revenue</div>
            </div>
            <div className="flex min-h-[130px] min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-lime p-5">
              <div className="text-[13px] font-medium text-ink/60">Outstanding</div>
              <div className="text-[28px] font-bold text-ink">{formatCurrency(outstanding)}</div>
              <div className="text-xs text-ink/55">
                {outstandingCount} {outstandingCount === 1 ? "invoice" : "invoices"} pending or overdue
              </div>
            </div>
          </div>

          <PaymentsList payments={payments} companyByLeadId={companyByLeadId} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-3 text-[15px] font-bold text-ink">Revenue by Client</div>
            {topClients.length === 0 ? (
              <div className="text-xs text-ink/40">No received payments yet.</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {topClients.map(([company, amount]) => (
                  <div key={company}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-ink/70">{company}</span>
                      <span className="flex-none font-semibold text-ink">{formatCurrencyFull(amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel">
                      <div
                        className="h-full rounded-full bg-lime"
                        style={{ width: `${(amount / maxClientRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-3 text-[15px] font-bold text-ink">Revenue by Project / OS</div>
            {topProjects.length === 0 ? (
              <div className="text-xs text-ink/40">No received payments yet.</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {topProjects.map(([project, amount]) => (
                  <div key={project}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-ink/70">{project}</span>
                      <span className="flex-none font-semibold text-ink">{formatCurrencyFull(amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel">
                      <div
                        className="h-full rounded-full bg-ink"
                        style={{ width: `${(amount / maxProjectRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
