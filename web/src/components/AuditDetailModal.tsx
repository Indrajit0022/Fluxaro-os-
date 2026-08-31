"use client";

import { useEffect, useState } from "react";
import { EVIDENCE_LABELS, type Audit, type Lead } from "@/lib/types";
import { PILLARS, PILLAR_LABELS } from "@/lib/operating-systems";

function pillarData(audit: Audit, pillar: (typeof PILLARS)[number]) {
  switch (pillar) {
    case "demand":
      return { score: audit.demand_score, evidenceType: audit.demand_evidence_type, evidence: audit.demand_evidence };
    case "revenue":
      return { score: audit.revenue_score, evidenceType: audit.revenue_evidence_type, evidence: audit.revenue_evidence };
    case "operations":
      return {
        score: audit.operations_score,
        evidenceType: audit.operations_evidence_type,
        evidence: audit.operations_evidence,
      };
    case "customer":
      return { score: audit.customer_score, evidenceType: audit.customer_evidence_type, evidence: audit.customer_evidence };
    case "intelligence":
      return {
        score: audit.intelligence_score,
        evidenceType: audit.intelligence_evidence_type,
        evidence: audit.intelligence_evidence,
      };
  }
}

export function AuditDetailModal({ auditId, onClose }: { auditId: string | null; onClose: () => void }) {
  if (!auditId) return null;
  return <AuditDetailContent key={auditId} auditId={auditId} onClose={onClose} />;
}

function AuditDetailContent({ auditId, onClose }: { auditId: string; onClose: () => void }) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/audits/${auditId}`)
      .then((res) => res.json())
      .then((body) => {
        setAudit(body.audit);
        setLead(body.lead);
      })
      .finally(() => setLoading(false));
  }, [auditId]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-[20px] bg-white p-6"
      >
        {loading || !audit ? (
          <div className="py-10 text-center text-sm text-ink/50">Loading…</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-ink">{lead?.company ?? "Growth Gap Audit"}</div>
                <div className="mt-0.5 text-xs text-ink/50">
                  {new Date(audit.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <button onClick={onClose} className="flex-none cursor-pointer text-ink/40 hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {PILLARS.map((key) => {
                const { score, evidenceType } = pillarData(audit, key);
                const isPrimary = audit.primary_bottleneck === key;
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
                    <div className="mt-1 text-lg font-bold" style={{ color: isPrimary ? "#fff" : "#141414" }}>
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

            {audit.primary_bottleneck && (
              <div className="mt-3 text-xs text-ink/60">
                Primary bottleneck: <strong className="text-ink">{PILLAR_LABELS[audit.primary_bottleneck]}</strong>
              </div>
            )}

            {audit.business_impact && (
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Business impact</div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{audit.business_impact}</div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {PILLARS.map((key) => {
                const { evidence } = pillarData(audit, key);
                if (!evidence) return null;
                return (
                  <div key={key}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      {PILLAR_LABELS[key]} evidence
                    </div>
                    <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{evidence}</div>
                  </div>
                );
              })}
            </div>

            {audit.notes && (
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Notes</div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink/80">{audit.notes}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
