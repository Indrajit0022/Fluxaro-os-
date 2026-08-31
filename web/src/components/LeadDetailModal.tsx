"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  PIPELINE_STAGES,
  STAGE_LABELS,
  PROPOSAL_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  EVIDENCE_LABELS,
  type Audit,
  type Lead,
  type LeadActivity,
  type NewLeadInput,
  type Payment,
  type PaymentStatus,
  type PipelineStage,
  type Proposal,
  type ProposalStatus,
} from "@/lib/types";
import { formatCurrencyFull } from "@/lib/format";
import { PILLARS, PILLAR_LABELS, OPERATING_SYSTEMS, type OperatingSystemKey } from "@/lib/operating-systems";
import { AuditModal } from "./AuditModal";
import { NewProposalModal } from "./NewProposalModal";
import { NewPaymentModal } from "./NewPaymentModal";

// Same lazy-loaded components used by /proposals and /cashflow — sharing
// the import path means the bundler serves one shared chunk either way.
const ProposalDetailModal = dynamic(
  () => import("./ProposalDetailModal").then((m) => m.ProposalDetailModal),
  { ssr: false }
);
const PaymentDetailModal = dynamic(
  () => import("./PaymentDetailModal").then((m) => m.PaymentDetailModal),
  { ssr: false }
);

function pillarData(audit: Audit, pillar: (typeof PILLARS)[number]) {
  switch (pillar) {
    case "demand":
      return { score: audit.demand_score, evidenceType: audit.demand_evidence_type };
    case "revenue":
      return { score: audit.revenue_score, evidenceType: audit.revenue_evidence_type };
    case "operations":
      return { score: audit.operations_score, evidenceType: audit.operations_evidence_type };
    case "customer":
      return { score: audit.customer_score, evidenceType: audit.customer_evidence_type };
    case "intelligence":
      return { score: audit.intelligence_score, evidenceType: audit.intelligence_evidence_type };
  }
}

function proposalStatusStyle(status: ProposalStatus) {
  if (status === "won") return { background: "#EAF76A", color: "#141414" };
  if (status === "lost") return { background: "#F4F3EF", color: "#8A8A86" };
  if (status === "sent") return { background: "#FFFBEB", color: "#D97706" };
  if (status === "approved") return { background: "#141414", color: "#fff" };
  return { background: "#F4F3EF", color: "#141414" };
}

function paymentStatusStyle(status: PaymentStatus) {
  if (status === "received") return { background: "#EAF76A", color: "#141414" };
  if (status === "overdue") return { background: "#FEE2E2", color: "#DC2626" };
  return { background: "#FFFBEB", color: "#D97706" };
}

type FormState = {
  company: string;
  contact_name: string;
  source: string;
  stage: PipelineStage;
  icp_score: string;
  growth_gap_score: string;
  deal_value: string;
  next_action: string;
  discovery_notes: string;
};

function toFormState(lead: Lead): FormState {
  return {
    company: lead.company,
    contact_name: lead.contact_name ?? "",
    source: lead.source ?? "",
    stage: lead.stage,
    icp_score: lead.icp_score != null ? String(lead.icp_score) : "",
    growth_gap_score: lead.growth_gap_score != null ? String(lead.growth_gap_score) : "",
    deal_value: lead.deal_value != null ? String(lead.deal_value) : "",
    next_action: lead.next_action ?? "",
    discovery_notes: lead.discovery_notes ?? "",
  };
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function LeadDetailModal({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  if (!leadId) return null;
  // Keyed by leadId so switching leads remounts this with fresh state,
  // instead of resetting state imperatively inside an effect.
  return <LeadDetailContent key={leadId} leadId={leadId} onClose={onClose} />;
}

function LeadDetailContent({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activity, setActivity] = useState<LeadActivity[]>([]);
  const [latestAudit, setLatestAudit] = useState<Audit | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [openProposalId, setOpenProposalId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refetchAuditsAndProposals() {
    fetch(`/api/leads/${leadId}/audits`)
      .then((res) => res.json())
      .then((body) => setLatestAudit(body.audits?.[0] ?? null));
    fetch(`/api/leads/${leadId}/proposals`)
      .then((res) => res.json())
      .then((body) => setProposals(body.proposals ?? []));
    fetch(`/api/leads/${leadId}/payments`)
      .then((res) => res.json())
      .then((body) => setPayments(body.payments ?? []));
  }

  useEffect(() => {
    fetch(`/api/leads/${leadId}`)
      .then((res) => res.json())
      .then((body) => {
        setLead(body.lead);
        setActivity(body.activity ?? []);
        setForm(toFormState(body.lead));
      })
      .finally(() => setLoading(false));
    refetchAuditsAndProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form || !leadId) return;
    setSaving(true);
    setError(null);
    try {
      const patch: Partial<NewLeadInput> & { stage?: PipelineStage } = {
        company: form.company.trim(),
        contact_name: form.contact_name.trim() || undefined,
        source: form.source.trim() || undefined,
        stage: form.stage,
        icp_score: form.icp_score ? Number(form.icp_score) : undefined,
        growth_gap_score: form.growth_gap_score ? Number(form.growth_gap_score) : undefined,
        deal_value: form.deal_value ? Number(form.deal_value) : undefined,
        next_action: form.next_action.trim() || undefined,
        discovery_notes: form.discovery_notes.trim() || undefined,
      };
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to save");
      const refreshed = await fetch(`/api/leads/${leadId}`).then((r) => r.json());
      setLead(refreshed.lead);
      setActivity(refreshed.activity ?? []);
      setForm(toFormState(refreshed.lead));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!leadId) return;
    setSaving(true);
    try {
      await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !lead || !form ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              {editing ? (
                <input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className="w-full rounded-lg border border-black/10 px-2 py-1 text-lg font-bold text-ink outline-none focus:border-ink"
                />
              ) : (
                <div className="text-lg font-bold text-ink">{lead.company}</div>
              )}
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            {!editing ? (
              <>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink">
                    {STAGE_LABELS[lead.stage]}
                  </span>
                  {lead.source && (
                    <span className="text-xs text-ink/50">via {lead.source}</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Contact</div>
                    <div className="mt-0.5 text-ink">{lead.contact_name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Deal value</div>
                    <div className="mt-0.5 text-ink">{formatCurrencyFull(lead.deal_value)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">ICP score</div>
                    <div className="mt-0.5 text-ink">{lead.icp_score ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Growth Gap</div>
                    <div className="mt-0.5 text-ink">{lead.growth_gap_score ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Next action</div>
                  <div className="mt-0.5 text-sm text-ink">{lead.next_action || "—"}</div>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Discovery notes</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{lead.discovery_notes || "—"}</div>
                </div>

                <div className="mt-6 border-t border-divider pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-ink">Growth Gap Audit</div>
                    <AuditModal
                      leadId={leadId}
                      onCreated={refetchAuditsAndProposals}
                      trigger={
                        <span className="cursor-pointer rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-[#EFEFE9]">
                          {latestAudit ? "Re-run Audit" : "Run Audit"}
                        </span>
                      }
                    />
                  </div>
                  {!latestAudit ? (
                    <div className="mt-2 text-xs text-ink/40">No audit yet.</div>
                  ) : (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {PILLARS.map((key) => {
                        const { score, evidenceType } = pillarData(latestAudit, key);
                        const isPrimary = latestAudit.primary_bottleneck === key;
                        return (
                          <div
                            key={key}
                            className="rounded-lg p-2 text-center"
                            style={{ background: isPrimary ? "#141414" : "#F4F3EF" }}
                          >
                            <div
                              className="text-[10px] font-semibold uppercase"
                              style={{ color: isPrimary ? "rgba(255,255,255,0.6)" : "rgba(20,20,20,0.5)" }}
                            >
                              {PILLAR_LABELS[key]}
                            </div>
                            <div
                              className="mt-1 text-lg font-bold"
                              style={{ color: isPrimary ? "#fff" : "#141414" }}
                            >
                              {score ?? "—"}
                            </div>
                            {evidenceType && (
                              <div
                                className="mt-0.5 text-[9px]"
                                style={{ color: isPrimary ? "rgba(255,255,255,0.5)" : "rgba(20,20,20,0.4)" }}
                              >
                                {EVIDENCE_LABELS[evidenceType]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {latestAudit?.business_impact && (
                    <div className="mt-2 text-xs leading-relaxed text-ink/60">{latestAudit.business_impact}</div>
                  )}
                </div>

                <div className="mt-6 border-t border-divider pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-ink">Proposals</div>
                    <NewProposalModal
                      leadId={leadId}
                      onCreated={refetchAuditsAndProposals}
                      trigger={
                        <span className="cursor-pointer rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-[#EFEFE9]">
                          + New Proposal
                        </span>
                      }
                    />
                  </div>
                  {proposals.length === 0 ? (
                    <div className="mt-2 text-xs text-ink/40">No proposals yet.</div>
                  ) : (
                    <div className="mt-2.5 flex flex-col gap-2">
                      {proposals.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setOpenProposalId(p.id)}
                          className="flex cursor-pointer items-center justify-between rounded-lg bg-panel px-3 py-2 hover:bg-[#EFEFE9]"
                        >
                          <div className="truncate text-xs font-semibold text-ink">
                            {p.recommended_os.map((k) => OPERATING_SYSTEMS[k as OperatingSystemKey]?.name ?? k).join(", ") || "Proposal"}
                          </div>
                          <span
                            className="flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={proposalStatusStyle(p.status)}
                          >
                            {PROPOSAL_STATUS_LABELS[p.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-divider pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-ink">Payments</div>
                    <NewPaymentModal
                      leadId={leadId}
                      onCreated={refetchAuditsAndProposals}
                      trigger={
                        <span className="cursor-pointer rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-[#EFEFE9]">
                          + Record Payment
                        </span>
                      }
                    />
                  </div>
                  {payments.length === 0 ? (
                    <div className="mt-2 text-xs text-ink/40">No payments yet.</div>
                  ) : (
                    <div className="mt-2.5 flex flex-col gap-2">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setOpenPaymentId(p.id)}
                          className="flex cursor-pointer items-center justify-between rounded-lg bg-panel px-3 py-2 hover:bg-[#EFEFE9]"
                        >
                          <div className="truncate text-xs font-semibold text-ink">
                            {formatCurrencyFull(p.amount)}
                            {p.milestone ? ` · ${p.milestone}` : ""}
                          </div>
                          <span
                            className="flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={paymentStatusStyle(p.status)}
                          >
                            {PAYMENT_STATUS_LABELS[p.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 cursor-pointer rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a]"
                  >
                    Edit
                  </button>
                  {confirmingDelete ? (
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex-1 cursor-pointer rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="flex-1 cursor-pointer rounded-full bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-6 border-t border-divider pt-4">
                  <div className="mb-2 text-sm font-bold text-ink">Activity</div>
                  {activity.length === 0 ? (
                    <div className="text-xs text-ink/40">No activity yet.</div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {activity.map((a) => (
                        <div key={a.id} className="flex items-start justify-between gap-3 text-xs">
                          <span className="text-ink/70">{a.detail}</span>
                          <span className="flex-none whitespace-nowrap text-ink/35">{relativeTime(a.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <label className="text-xs font-semibold text-ink/60">
                  Contact name
                  <input
                    value={form.contact_name}
                    onChange={(e) => set("contact_name", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-ink/60">
                    Source
                    <input
                      value={form.source}
                      onChange={(e) => set("source", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink/60">
                    Stage
                    <select
                      value={form.stage}
                      onChange={(e) => set("stage", e.target.value as PipelineStage)}
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
                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs font-semibold text-ink/60">
                    ICP score
                    <input
                      value={form.icp_score}
                      onChange={(e) => set("icp_score", e.target.value)}
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink/60">
                    Growth Gap
                    <input
                      value={form.growth_gap_score}
                      onChange={(e) => set("growth_gap_score", e.target.value)}
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink/60">
                    Deal value ($)
                    <input
                      value={form.deal_value}
                      onChange={(e) => set("deal_value", e.target.value)}
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                  </label>
                </div>
                <label className="text-xs font-semibold text-ink/60">
                  Next action
                  <input
                    value={form.next_action}
                    onChange={(e) => set("next_action", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  />
                </label>
                <label className="text-xs font-semibold text-ink/60">
                  Discovery notes
                  <textarea
                    value={form.discovery_notes}
                    onChange={(e) => set("discovery_notes", e.target.value)}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                  />
                </label>

                {error && <div className="text-xs font-medium text-red-600">{error}</div>}

                <div className="mt-1 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm(toFormState(lead));
                      setError(null);
                    }}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-panel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ProposalDetailModal proposalId={openProposalId} onClose={() => setOpenProposalId(null)} />
      <PaymentDetailModal paymentId={openPaymentId} onClose={() => setOpenPaymentId(null)} />
    </div>
  );
}
