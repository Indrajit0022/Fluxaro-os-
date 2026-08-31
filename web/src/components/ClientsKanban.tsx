"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PIPELINE_STAGES, STAGE_LABELS, type Lead, type PipelineStage } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/format";

const BUCKETS: { title: string; stages: PipelineStage[] }[] = [
  { title: "In Touch", stages: ["new", "qualified", "discovery"] },
  { title: "Offer Sent", stages: ["audit", "proposal_sent", "negotiation"] },
  { title: "Discussion", stages: ["won", "lost"] },
];

function tagStyle(stage: PipelineStage) {
  if (stage === "won") return { bg: "#EAF76A", color: "#141414" };
  if (stage === "lost") return { bg: "#F4F3EF", color: "#8A8A86" };
  if (stage === "new") return { bg: "#141414", color: "#fff" };
  if (stage === "proposal_sent" || stage === "negotiation")
    return { bg: "#FFFBEB", color: "#D97706" };
  return { bg: "#EAF76A", color: "#141414" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const tag = tagStyle(lead.stage);
  const dark = lead.stage === "negotiation";

  async function changeStage(stage: PipelineStage) {
    setUpdating(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      router.refresh();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className="rounded-[18px] p-4"
      style={{ background: dark ? "#141414" : "#fff" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: tag.bg, color: tag.color }}
        >
          {STAGE_LABELS[lead.stage]}
        </span>
      </div>
      <div
        className="mt-3 text-sm font-bold"
        style={{ color: dark ? "#fff" : "#141414" }}
      >
        {lead.company}
      </div>
      <div
        className="mt-1 text-xs leading-snug"
        style={{ color: dark ? "rgba(255,255,255,0.65)" : "rgba(20,20,20,0.55)" }}
      >
        {lead.next_action || lead.discovery_notes || "—"}
      </div>
      <div
        className="mt-3.5 flex items-center justify-between border-t pt-3"
        style={{ borderColor: dark ? "rgba(255,255,255,0.15)" : "#F1F1EC" }}
      >
        <div
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: dark ? "rgba(255,255,255,0.55)" : "rgba(20,20,20,0.45)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(lead.updated_at)}
        </div>
        <div
          className="text-[11px] font-semibold"
          style={{ color: dark ? "#fff" : "#141414" }}
        >
          {lead.deal_value ? formatCurrencyFull(lead.deal_value) : "—"}
        </div>
      </div>
      <select
        value={lead.stage}
        disabled={updating}
        onChange={(e) => changeStage(e.target.value as PipelineStage)}
        className="mt-3 w-full rounded-lg border px-2 py-1.5 text-[11px] font-medium outline-none"
        style={{
          borderColor: dark ? "rgba(255,255,255,0.2)" : "rgba(20,20,20,0.12)",
          background: dark ? "rgba(255,255,255,0.08)" : "#F4F3EF",
          color: dark ? "#fff" : "#141414",
        }}
      >
        {PIPELINE_STAGES.map((s) => (
          <option key={s} value={s}>
            Move to {STAGE_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ClientsKanban({ leads }: { leads: Lead[] }) {
  const newestLead = [...leads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  return (
    <div className="mt-4 grid grid-cols-[240px_repeat(3,minmax(0,1fr))] items-start gap-4">
      <div className="flex min-h-[230px] flex-col justify-between rounded-[20px] bg-ink p-[22px]">
        <div>
          <div className="text-[17px] font-bold leading-snug text-white">
            {newestLead ? `${newestLead.company} just came in.` : "No leads yet."}
          </div>
          <div className="mt-2.5 text-xs leading-relaxed text-white/60">
            {newestLead ? "Review it before it goes cold." : "Add your first lead to get started."}
          </div>
        </div>
      </div>

      {BUCKETS.map((bucket) => {
        const cards = leads.filter((l) => bucket.stages.includes(l.stage));
        return (
          <div key={bucket.title} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-baseline gap-1.5">
              <div className="text-[15px] font-bold text-ink">{bucket.title}</div>
              <div className="text-xs text-ink/45">/{cards.length}</div>
            </div>
            {cards.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
