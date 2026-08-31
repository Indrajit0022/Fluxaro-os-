"use client";

import { useState } from "react";
import { EVIDENCE_LABELS, type Audit } from "@/lib/types";
import { PILLARS, PILLAR_LABELS } from "@/lib/operating-systems";
import { AuditDetailModal } from "./AuditDetailModal";

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

export function GrowthGapList({
  audits,
  companyByLeadId,
}: {
  audits: Audit[];
  companyByLeadId: Record<string, string>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (audits.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">
        No audits yet — run one from a lead to diagnose their primary bottleneck.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-3">
        {audits.map((audit) => (
          <div
            key={audit.id}
            onClick={() => setOpenId(audit.id)}
            className="cursor-pointer rounded-[18px] bg-white p-4 hover:bg-[#FCFCFA]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-ink">
                {companyByLeadId[audit.lead_id] ?? "Unknown lead"}
              </div>
              <div className="flex-none text-xs text-ink/40">
                {new Date(audit.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
            {audit.primary_bottleneck && (
              <div className="mt-1 text-xs text-ink/50">
                Bottleneck: <strong className="text-ink">{PILLAR_LABELS[audit.primary_bottleneck]}</strong>
              </div>
            )}
            <div className="mt-3 grid grid-cols-5 gap-2">
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
                      className="text-[9px] font-semibold uppercase"
                      style={{ color: isPrimary ? "rgba(255,255,255,0.6)" : "rgba(20,20,20,0.5)" }}
                    >
                      {PILLAR_LABELS[key]}
                    </div>
                    <div
                      className="mt-0.5 text-base font-bold"
                      style={{ color: isPrimary ? "#fff" : "#141414" }}
                    >
                      {score ?? "—"}
                    </div>
                    {evidenceType && (
                      <div
                        className="mt-0.5 text-[8px]"
                        style={{ color: isPrimary ? "rgba(255,255,255,0.5)" : "rgba(20,20,20,0.4)" }}
                      >
                        {EVIDENCE_LABELS[evidenceType]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <AuditDetailModal auditId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
