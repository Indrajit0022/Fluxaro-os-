"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PAYMENT_STATUS_LABELS, type Payment, type PaymentStatus } from "@/lib/types";
import { formatCurrencyFull, initialOf } from "@/lib/format";

const PaymentDetailModal = dynamic(
  () => import("./PaymentDetailModal").then((m) => m.PaymentDetailModal),
  { ssr: false }
);

function statusStyle(status: PaymentStatus) {
  if (status === "received") return { background: "#EAF76A", color: "#141414" };
  if (status === "overdue") return { background: "#FEE2E2", color: "#DC2626" };
  return { background: "#FFFBEB", color: "#D97706" };
}

export function PaymentsList({
  payments,
  companyByLeadId,
}: {
  payments: Payment[];
  companyByLeadId: Record<string, string>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-3.5 text-base font-bold text-ink">Recent Payments</div>
      {payments.length === 0 ? (
        <div className="py-6 text-center text-sm text-ink/40">No payments logged yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
            <div>Client</div>
            <div>Date</div>
            <div>Status</div>
            <div className="text-right">Amount</div>
          </div>
          {payments.map((p) => {
            const company = companyByLeadId[p.lead_id] ?? "Unknown";
            const date = p.status === "received" ? p.date_received : p.expected_date;
            return (
              <div
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr] items-center border-t border-divider px-1 py-3 hover:bg-[#FCFCFA]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-panel text-xs font-bold text-ink">
                    {initialOf(company)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">{company}</div>
                    {p.milestone && <div className="truncate text-[11px] text-ink/45">{p.milestone}</div>}
                  </div>
                </div>
                <div className="text-xs text-ink/55">{date ?? "—"}</div>
                <div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={statusStyle(p.status)}
                  >
                    {PAYMENT_STATUS_LABELS[p.status]}
                  </span>
                </div>
                <div className="text-right text-[13px] font-semibold text-ink">
                  {formatCurrencyFull(p.amount)}
                </div>
              </div>
            );
          })}
        </>
      )}

      <PaymentDetailModal paymentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
