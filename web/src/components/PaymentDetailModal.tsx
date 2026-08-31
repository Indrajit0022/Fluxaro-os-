"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_STATUS_LABELS, type Lead, type Payment, type PaymentStatus } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/format";

function statusStyle(status: PaymentStatus) {
  if (status === "received") return { bg: "#EAF76A", color: "#141414" };
  if (status === "overdue") return { bg: "#FEE2E2", color: "#DC2626" };
  return { bg: "#FFFBEB", color: "#D97706" };
}

export function PaymentDetailModal({ paymentId, onClose }: { paymentId: string | null; onClose: () => void }) {
  if (!paymentId) return null;
  return <PaymentDetailContent key={paymentId} paymentId={paymentId} onClose={onClose} />;
}

function PaymentDetailContent({ paymentId, onClose }: { paymentId: string; onClose: () => void }) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/payments/${paymentId}`)
      .then((res) => res.json())
      .then((body) => {
        setPayment(body.payment);
        setLead(body.lead);
      })
      .finally(() => setLoading(false));
  }, [paymentId]);

  async function changeStatus(status: PaymentStatus) {
    setBusy(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      setPayment(body.payment);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
      router.refresh();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !payment ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-ink">{lead?.company ?? "Payment"}</div>
                <span
                  className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={statusStyle(payment.status)}
                >
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </span>
              </div>
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 text-[28px] font-bold text-ink">{formatCurrencyFull(payment.amount)}</div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Project</div>
                <div className="mt-0.5 text-ink">{payment.project || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Milestone</div>
                <div className="mt-0.5 text-ink">{payment.milestone || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Method</div>
                <div className="mt-0.5 text-ink">{payment.method || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  {payment.status === "received" ? "Date received" : "Expected date"}
                </div>
                <div className="mt-0.5 text-ink">
                  {(payment.status === "received" ? payment.date_received : payment.expected_date) || "—"}
                </div>
              </div>
            </div>

            {payment.notes && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Notes</div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{payment.notes}</div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {payment.status !== "received" && (
                <button
                  onClick={() => changeStatus("received")}
                  disabled={busy}
                  className="flex-1 cursor-pointer rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:bg-[#dcee4f] disabled:opacity-50"
                >
                  Mark Received
                </button>
              )}
              {payment.status !== "overdue" && payment.status !== "received" && (
                <button
                  onClick={() => changeStatus("overdue")}
                  disabled={busy}
                  className="flex-1 cursor-pointer rounded-full bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  Mark Overdue
                </button>
              )}
              {payment.status !== "pending" && (
                <button
                  onClick={() => changeStatus("pending")}
                  disabled={busy}
                  className="flex-1 cursor-pointer rounded-full bg-panel py-2.5 text-sm font-semibold text-ink hover:bg-[#EFEFE9] disabled:opacity-50"
                >
                  Mark Pending
                </button>
              )}
            </div>

            <div className="mt-2">
              {confirmingDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="w-full cursor-pointer rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full cursor-pointer rounded-full py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
