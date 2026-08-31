"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, type Lead, type NewPaymentInput, type PaymentStatus } from "@/lib/types";

export function NewPaymentModal({
  leadId,
  trigger,
  onCreated,
}: {
  leadId?: string;
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState(leadId ?? "");
  const [project, setProject] = useState("");
  const [milestone, setMilestone] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("received");
  const [dateReceived, setDateReceived] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || leadId) return;
    fetch("/api/leads")
      .then((res) => res.json())
      .then((body) => setLeads(body.leads ?? []));
  }, [open, leadId]);

  function reset() {
    setProject("");
    setMilestone("");
    setAmount("");
    setMethod("");
    setStatus("received");
    setDateReceived(new Date().toISOString().slice(0, 10));
    setExpectedDate("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLeadId) {
      setError("Choose a client first");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: NewPaymentInput = {
        lead_id: selectedLeadId,
        project: project.trim() || undefined,
        milestone: milestone.trim() || undefined,
        amount: Number(amount),
        method: method.trim() || undefined,
        status,
        date_received: status === "received" ? dateReceived : undefined,
        expected_date: status !== "received" ? expectedDate || undefined : undefined,
        notes: notes.trim() || undefined,
      };
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save payment");
      reset();
      setOpen(false);
      router.refresh();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="flex max-h-[85vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div className="text-lg font-bold text-ink">Record Payment</div>

            {!leadId && (
              <label className="text-xs font-semibold text-ink/60">
                Client
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  <option value="">Select a client…</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Project / OS
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Revenue OS"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Milestone
                <input
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  placeholder="50% upfront"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Amount ($)
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Method
                <input
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Bank transfer"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>

            <label className="text-xs font-semibold text-ink/60">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PAYMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            {status === "received" ? (
              <label className="text-xs font-semibold text-ink/60">
                Date received
                <input
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            ) : (
              <label className="text-xs font-semibold text-ink/60">
                Expected date
                <input
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  type="date"
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            )}

            <label className="text-xs font-semibold text-ink/60">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>

            {error && <div className="text-xs font-medium text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-panel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save Payment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
