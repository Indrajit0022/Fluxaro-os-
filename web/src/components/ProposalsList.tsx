"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Proposal, ProposalStatus } from "@/lib/types";
import { PROPOSAL_STATUS_LABELS } from "@/lib/types";
import { OPERATING_SYSTEMS, type OperatingSystemKey } from "@/lib/operating-systems";
import { formatCurrencyFull } from "@/lib/format";

const ProposalDetailModal = dynamic(
  () => import("./ProposalDetailModal").then((m) => m.ProposalDetailModal),
  { ssr: false }
);

function statusStyle(status: ProposalStatus) {
  if (status === "won") return { background: "#EAF76A", color: "#141414" };
  if (status === "lost") return { background: "#F4F3EF", color: "#8A8A86" };
  if (status === "sent") return { background: "#FFFBEB", color: "#D97706" };
  if (status === "approved") return { background: "#141414", color: "#fff" };
  return { background: "#F4F3EF", color: "#141414" };
}

export function ProposalsList({
  proposals,
  companyByLeadId,
}: {
  proposals: Proposal[];
  companyByLeadId: Record<string, string>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (proposals.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">
        No proposals yet — create one from a lead&apos;s Growth Gap audit.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] bg-white px-5 py-2">
        <div className="grid grid-cols-[1.6fr_1.4fr_0.8fr_0.9fr_0.9fr] px-1 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          <div>Client</div>
          <div>Recommended OS</div>
          <div>Tier</div>
          <div>Price</div>
          <div>Status</div>
        </div>
        {proposals.map((p) => (
          <div
            key={p.id}
            onClick={() => setOpenId(p.id)}
            className="grid cursor-pointer grid-cols-[1.6fr_1.4fr_0.8fr_0.9fr_0.9fr] items-center border-t border-divider px-1 py-3 hover:bg-[#FCFCFA]"
          >
            <div className="truncate text-[13px] font-semibold text-ink">
              {companyByLeadId[p.lead_id] ?? "Unknown"}
            </div>
            <div className="truncate text-xs text-ink/60">
              {p.recommended_os.map((k) => OPERATING_SYSTEMS[k as OperatingSystemKey]?.name ?? k).join(", ") || "—"}
            </div>
            <div className="text-xs capitalize text-ink/70">{p.tier ?? "—"}</div>
            <div className="text-xs font-semibold text-ink">{formatCurrencyFull(p.price)}</div>
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={statusStyle(p.status)}
              >
                {PROPOSAL_STATUS_LABELS[p.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ProposalDetailModal proposalId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
