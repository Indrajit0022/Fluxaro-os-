"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkspaceSettings, WorkspaceSettingsPatch } from "@/lib/types";

const TOGGLE_DEFS = [
  { key: "email_alerts", label: "Email Alerts", sub: "Pipeline activity and overdue proposals" },
  { key: "slack_alerts", label: "Slack Alerts", sub: "Post updates to #fluxaro-ops" },
  { key: "weekly_digest", label: "Weekly Digest", sub: "Summary every Monday morning" },
] as const;

export function NotificationToggles({ settings }: { settings: WorkspaceSettings }) {
  const router = useRouter();
  const [current, setCurrent] = useState(settings);
  const [saving, setSaving] = useState(false);

  async function toggle(key: (typeof TOGGLE_DEFS)[number]["key"]) {
    if (saving) return;
    const next = { ...current, [key]: !current[key] };
    setCurrent(next);
    setSaving(true);
    try {
      const patch: WorkspaceSettingsPatch = { [key]: next[key] };
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.refresh();
    } catch {
      setCurrent(current);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-1.5 text-[15px] font-bold text-ink">Notifications</div>
      {TOGGLE_DEFS.map((row) => {
        const on = current[row.key];
        return (
          <div key={row.key} className="flex items-center justify-between border-t border-divider py-3.5">
            <div>
              <div className="text-[13px] font-semibold text-ink">{row.label}</div>
              <div className="mt-0.5 text-xs text-ink/50">{row.sub}</div>
            </div>
            <div
              onClick={() => toggle(row.key)}
              className="relative h-[22px] w-10 flex-none cursor-pointer rounded-full"
              style={{ background: on ? "#141414" : "#EDEDE6" }}
            >
              <div
                className="absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all"
                style={{ left: on ? 20 : 2, background: on ? "#EAF76A" : "#fff" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
