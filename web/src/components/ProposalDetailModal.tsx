"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, Proposal, ProposalStatus } from "@/lib/types";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types";
import { OPERATING_SYSTEMS, type OperatingSystemKey } from "@/lib/operating-systems";
import { formatCurrencyFull } from "@/lib/format";

function statusStyle(status: ProposalStatus) {
  if (status === "won") return { background: "#EAF76A", color: "#141414" };
  if (status === "lost") return { background: "#F4F3EF", color: "#8A8A86" };
  if (status === "sent") return { background: "#FFFBEB", color: "#D97706" };
  if (status === "approved") return { background: "#141414", color: "#fff" };
  return { background: "#F4F3EF", color: "#141414" };
}

export function ProposalDetailModal({
  proposalId,
  onClose,
}: {
  proposalId: string | null;
  onClose: () => void;
}) {
  if (!proposalId) return null;
  return <ProposalDetailContent key={proposalId} proposalId={proposalId} onClose={onClose} />;
}

function ProposalDetailContent({ proposalId, onClose }: { proposalId: string; onClose: () => void }) {
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/proposals/${proposalId}`)
      .then((res) => res.json())
      .then((body) => {
        setProposal(body.proposal);
        setLead(body.lead);
      })
      .finally(() => setLoading(false));
  }, [proposalId]);

  async function changeStatus(status: ProposalStatus) {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      setProposal(body.proposal);
      router.refresh();
    } finally {
      setTransitioning(false);
    }
  }

  async function handleDelete() {
    setTransitioning(true);
    try {
      await fetch(`/api/proposals/${proposalId}`, { method: "DELETE" });
      router.refresh();
      onClose();
    } finally {
      setTransitioning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !proposal ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-ink">{lead?.company ?? "Proposal"}</div>
                <span
                  className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={statusStyle(proposal.status)}
                >
                  {PROPOSAL_STATUS_LABELS[proposal.status]}
                </span>
              </div>
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {proposal.recommended_os.map((key) => (
                <span key={key} className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink">
                  {OPERATING_SYSTEMS[key as OperatingSystemKey]?.name ?? key}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Tier</div>
                <div className="mt-0.5 text-ink capitalize">{proposal.tier ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Price</div>
                <div className="mt-0.5 text-ink">{formatCurrencyFull(proposal.price)}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Timeline</div>
                <div className="mt-0.5 text-ink">
                  {proposal.timeline_weeks_min && proposal.timeline_weeks_max
                    ? `${proposal.timeline_weeks_min}–${proposal.timeline_weeks_max} weeks`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Sent</div>
                <div className="mt-0.5 text-ink">
                  {proposal.sent_at ? new Date(proposal.sent_at).toLocaleDateString() : "Not yet sent"}
                </div>
              </div>
            </div>

            {proposal.executive_summary && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  Executive summary
                </div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{proposal.executive_summary}</div>
              </div>
            )}
            {proposal.scope_notes && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Scope</div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{proposal.scope_notes}</div>
              </div>
            )}
            {proposal.exclusions && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  Not included
                </div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{proposal.exclusions}</div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {proposal.status === "draft" && (
                <button
                  onClick={() => changeStatus("approved")}
                  disabled={transitioning}
                  className="flex-1 cursor-pointer rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {proposal.status === "approved" && (
                <>
                  <button
                    onClick={() => changeStatus("draft")}
                    disabled={transitioning}
                    className="flex-1 cursor-pointer rounded-full bg-panel py-2.5 text-sm font-semibold text-ink hover:bg-[#EFEFE9]"
                  >
                    Back to Draft
                  </button>
                  <button
                    onClick={() => changeStatus("sent")}
                    disabled={transitioning}
                    className="flex-1 cursor-pointer rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50"
                  >
                    Mark Sent
                  </button>
                </>
              )}
              {proposal.status === "sent" && (
                <>
                  <button
                    onClick={() => changeStatus("won")}
                    disabled={transitioning}
                    className="flex-1 cursor-pointer rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:bg-[#dcee4f] disabled:opacity-50"
                  >
                    Mark Won
                  </button>
                  <button
                    onClick={() => changeStatus("lost")}
                    disabled={transitioning}
                    className="flex-1 cursor-pointer rounded-full bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Mark Lost
                  </button>
                </>
              )}
            </div>

            <div className="mt-2">
              {confirmingDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={transitioning}
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
