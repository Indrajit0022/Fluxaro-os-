"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STAGE_LABELS, type Lead } from "@/lib/types";
import { daysUntil } from "@/lib/format";

const LeadDetailModal = dynamic(
  () => import("./LeadDetailModal").then((m) => m.LeadDetailModal),
  { ssr: false }
);

function dueLabel(dateStr: string): { text: string; style: { background: string; color: string } } {
  const diff = daysUntil(dateStr);
  const date = new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (diff < 0) {
    return { text: `${date} · ${Math.abs(diff)}d overdue`, style: { background: "#FEE2E2", color: "#DC2626" } };
  }
  if (diff === 0) {
    return { text: `${date} · Today`, style: { background: "#FFFBEB", color: "#D97706" } };
  }
  return { text: date, style: { background: "#F4F3EF", color: "#141414" } };
}

export function FollowUpsList({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markFollowedUp(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follow_up_date: null }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-8 text-center text-sm text-ink/50">
        No follow-ups scheduled — set one from a lead&apos;s detail view.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] bg-white px-5 py-2">
        <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1.6fr_auto] px-1 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          <div>Client</div>
          <div>Contact</div>
          <div>Due</div>
          <div>Next action</div>
          <div />
        </div>
        {leads.map((lead) => {
          const due = lead.follow_up_date ? dueLabel(lead.follow_up_date) : null;
          return (
            <div
              key={lead.id}
              className="grid grid-cols-[1.4fr_1.2fr_1fr_1.6fr_auto] items-center border-t border-divider px-1 py-3"
            >
              <div
                onClick={() => setOpenLeadId(lead.id)}
                className="cursor-pointer truncate text-[13px] font-semibold text-ink hover:underline"
              >
                {lead.company}
              </div>
              <div className="truncate text-xs text-ink/60">{lead.contact_name || "—"}</div>
              <div>
                {due && (
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={due.style}
                  >
                    {due.text}
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-ink/60">{lead.next_action || STAGE_LABELS[lead.stage]}</div>
              <button
                onClick={() => markFollowedUp(lead.id)}
                disabled={busyId === lead.id}
                className="cursor-pointer whitespace-nowrap rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-[#EFEFE9] disabled:opacity-50"
              >
                Mark followed up
              </button>
            </div>
          );
        })}
      </div>

      <LeadDetailModal leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
    </>
  );
}
