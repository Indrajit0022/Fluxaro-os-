"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Audit, Lead, NewProposalInput } from "@/lib/types";
import {
  OPERATING_SYSTEMS,
  OS_TIERS,
  PILLAR_TO_OS,
  suggestPrice,
  type OperatingSystemKey,
  type OsTier,
} from "@/lib/operating-systems";

export function NewProposalModal({
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
  const [latestAudit, setLatestAudit] = useState<Audit | null>(null);

  const [selectedOs, setSelectedOs] = useState<OperatingSystemKey[]>([]);
  const [tier, setTier] = useState<OsTier>("starter");
  const [price, setPrice] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [scopeNotes, setScopeNotes] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [timelineMin, setTimelineMin] = useState("");
  const [timelineMax, setTimelineMax] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!leadId) {
      fetch("/api/leads")
        .then((res) => res.json())
        .then((body) => setLeads(body.leads ?? []));
    }
  }, [open, leadId]);

  useEffect(() => {
    if (!open || !selectedLeadId) return;
    fetch(`/api/leads/${selectedLeadId}/audits`)
      .then((res) => res.json())
      .then((body) => {
        const audit: Audit | null = body.audits?.[0] ?? null;
        setLatestAudit(audit);
        if (audit?.primary_bottleneck && selectedOs.length === 0) {
          const suggested = [PILLAR_TO_OS[audit.primary_bottleneck]];
          setSelectedOs(suggested);
          applySuggestedPrice(suggested, tier);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedLeadId]);

  const [priceTouched, setPriceTouched] = useState(false);

  function applySuggestedPrice(osList: OperatingSystemKey[], forTier: OsTier) {
    if (priceTouched || osList.length !== 1) return;
    const suggested = suggestPrice(osList[0], forTier);
    if (suggested != null) setPrice(String(suggested));
  }

  function toggleOs(key: OperatingSystemKey) {
    setSelectedOs((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      applySuggestedPrice(next, tier);
      return next;
    });
  }

  function handleTierChange(nextTier: OsTier) {
    setTier(nextTier);
    applySuggestedPrice(selectedOs, nextTier);
  }

  function reset() {
    setSelectedOs([]);
    setTier("starter");
    setPrice("");
    setPriceTouched(false);
    setExecutiveSummary("");
    setScopeNotes("");
    setExclusions("");
    setTimelineMin("");
    setTimelineMax("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLeadId) {
      setError("Choose a lead first");
      return;
    }
    if (selectedOs.length === 0) {
      setError("Recommend at least one Operating System");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: NewProposalInput = {
        lead_id: selectedLeadId,
        audit_id: latestAudit?.id ?? undefined,
        recommended_os: selectedOs,
        tier,
        price: price ? Number(price) : undefined,
        executive_summary: executiveSummary.trim() || undefined,
        scope_notes: scopeNotes.trim() || undefined,
        exclusions: exclusions.trim() || undefined,
        timeline_weeks_min: timelineMin ? Number(timelineMin) : undefined,
        timeline_weeks_max: timelineMax ? Number(timelineMax) : undefined,
      };
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create proposal");
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
            className="flex max-h-[85vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-[20px] bg-white p-6"
          >
            <div className="text-lg font-bold text-ink">New Proposal</div>

            {!leadId && (
              <label className="text-xs font-semibold text-ink/60">
                Lead
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  <option value="">Select a lead…</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {latestAudit?.primary_bottleneck && (
              <div className="rounded-lg bg-panel px-3 py-2 text-xs text-ink/70">
                Latest audit flags <strong>{latestAudit.primary_bottleneck}</strong> as the primary
                bottleneck — pre-selected the matching OS below.
              </div>
            )}

            <div>
              <div className="mb-1.5 text-xs font-semibold text-ink/60">Recommended Operating System(s)</div>
              <div className="flex flex-col gap-1.5">
                {Object.values(OPERATING_SYSTEMS).map((os) => (
                  <label key={os.key} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={selectedOs.includes(os.key)}
                      onChange={() => toggleOs(os.key)}
                    />
                    {os.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Tier
                <select
                  value={tier}
                  onChange={(e) => handleTierChange(e.target.value as OsTier)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  {OS_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Price ($)
                <input
                  value={price}
                  onChange={(e) => {
                    setPriceTouched(true);
                    setPrice(e.target.value);
                  }}
                  type="number"
                  min={0}
                  placeholder={tier === "enterprise" ? "Custom quote" : undefined}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-ink/60">
                Timeline min (weeks)
                <input
                  value={timelineMin}
                  onChange={(e) => setTimelineMin(e.target.value)}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="text-xs font-semibold text-ink/60">
                Timeline max (weeks)
                <input
                  value={timelineMax}
                  onChange={(e) => setTimelineMax(e.target.value)}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </label>
            </div>

            <label className="text-xs font-semibold text-ink/60">
              Executive summary
              <textarea
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              Scope notes
              <textarea
                value={scopeNotes}
                onChange={(e) => setScopeNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="text-xs font-semibold text-ink/60">
              What&apos;s NOT included
              <textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
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
                {submitting ? "Creating…" : "Create Draft"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
