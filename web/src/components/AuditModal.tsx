"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVIDENCE_TYPES, EVIDENCE_LABELS, type EvidenceType, type PillarInput, type PillarKey } from "@/lib/types";
import { PILLARS, PILLAR_LABELS } from "@/lib/operating-systems";

type PillarForm = { score: string; evidence_type: EvidenceType | ""; evidence: string };

function emptyPillar(): PillarForm {
  return { score: "", evidence_type: "", evidence: "" };
}

export function AuditModal({
  leadId,
  trigger,
  onCreated,
}: {
  leadId: string;
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pillars, setPillars] = useState<Record<PillarKey, PillarForm>>({
    demand: emptyPillar(),
    revenue: emptyPillar(),
    operations: emptyPillar(),
    customer: emptyPillar(),
    intelligence: emptyPillar(),
  });
  const [primaryBottleneck, setPrimaryBottleneck] = useState<PillarKey | "">("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [notes, setNotes] = useState("");

  function setPillar(key: PillarKey, patch: Partial<PillarForm>) {
    setPillars((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, PillarInput | PillarKey | string | null | undefined> = {
        primary_bottleneck: primaryBottleneck || null,
        business_impact: businessImpact.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      for (const key of PILLARS) {
        const f = pillars[key];
        body[key] = {
          score: f.score ? Number(f.score) : null,
          evidence_type: f.evidence_type || null,
          evidence: f.evidence.trim() || null,
        } satisfies PillarInput;
      }
      const res = await fetch(`/api/leads/${leadId}/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save audit");
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
            className="flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div>
              <div className="text-lg font-bold text-ink">Growth Gap Audit</div>
              <div className="mt-1 text-xs text-ink/50">
                Score each pillar 1-10 and label the evidence honestly — don&apos;t mark something
                Verified unless you actually have data for it.
              </div>
            </div>

            {PILLARS.map((key) => (
              <div key={key} className="rounded-xl border border-black/10 p-3">
                <div className="mb-2 text-sm font-bold text-ink">{PILLAR_LABELS[key]}</div>
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <input
                    value={pillars[key].score}
                    onChange={(e) => setPillar(key, { score: e.target.value })}
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1-10"
                    className="rounded-lg border border-black/10 px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                  />
                  <select
                    value={pillars[key].evidence_type}
                    onChange={(e) => setPillar(key, { evidence_type: e.target.value as EvidenceType })}
                    className="rounded-lg border border-black/10 px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                  >
                    <option value="">Evidence type…</option>
                    {EVIDENCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EVIDENCE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={pillars[key].evidence}
                  onChange={(e) => setPillar(key, { evidence: e.target.value })}
                  placeholder="Evidence / notes for this score"
                  rows={2}
                  className="mt-2 w-full resize-none rounded-lg border border-black/10 px-2 py-1.5 text-xs text-ink outline-none focus:border-ink"
                />
              </div>
            ))}

            <label className="text-xs font-semibold text-ink/60">
              Primary bottleneck (highest impact, not just lowest score)
              <select
                value={primaryBottleneck}
                onChange={(e) => setPrimaryBottleneck(e.target.value as PillarKey)}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                <option value="">Select pillar…</option>
                {PILLARS.map((key) => (
                  <option key={key} value={key}>
                    {PILLAR_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-ink/60">
              Business impact
              <textarea
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value)}
                rows={2}
                placeholder="Quantify where possible — hours lost, revenue leakage, missed deals"
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>

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
                {submitting ? "Saving…" : "Save Audit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
