"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage } from "@/lib/types";

export function NewLeadModal({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [source, setSource] = useState("");
  const [stage, setStage] = useState<PipelineStage>("new");
  const [icpScore, setIcpScore] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [discoveryNotes, setDiscoveryNotes] = useState("");

  function reset() {
    setCompany("");
    setContactName("");
    setSource("");
    setStage("new");
    setIcpScore("");
    setDealValue("");
    setNextAction("");
    setDiscoveryNotes("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) {
      setError("Company name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          contact_name: contactName.trim() || undefined,
          source: source.trim() || undefined,
          stage,
          icp_score: icpScore ? Number(icpScore) : undefined,
          deal_value: dealValue ? Number(dealValue) : undefined,
          next_action: nextAction.trim() || undefined,
          discovery_notes: discoveryNotes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create lead");
      }
      reset();
      setOpen(false);
      router.refresh();
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
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="flex max-h-[85vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div className="text-lg font-bold text-ink">New Lead</div>

            <label className="text-xs font-semibold text-ink/60">
              Company *
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                placeholder="Acme Robotics"
                autoFocus
              />
            </label>

            <label className="text-xs font-semibold text-ink/60">
              Contact name
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                placeholder="Dana Ruiz"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Source
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  placeholder="Referral"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Stage
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as PipelineStage)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                ICP score (0-100)
                <input
                  value={icpScore}
                  onChange={(e) => setIcpScore(e.target.value)}
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Deal value ($)
                <input
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>

            <label className="text-xs font-semibold text-ink/60">
              Next action
              <input
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                placeholder="Book intro call"
              />
            </label>

            <label className="text-xs font-semibold text-ink/60">
              Discovery notes
              <textarea
                value={discoveryNotes}
                onChange={(e) => setDiscoveryNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>

            {error && <div className="text-xs font-medium text-red-600">{error}</div>}

            <div className="mt-1 flex justify-end gap-2">
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
                {submitting ? "Adding…" : "Add Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
