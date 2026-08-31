"use client";

import { useState } from "react";

const TOGGLE_DEFS = [
  { key: "email", label: "Email Alerts", sub: "Pipeline activity and overdue proposals" },
  { key: "slack", label: "Slack Alerts", sub: "Post updates to #fluxaro-ops" },
  { key: "digest", label: "Weekly Digest", sub: "Summary every Monday morning" },
] as const;

export function NotificationToggles() {
  const [toggles, setToggles] = useState({ email: true, slack: false, digest: true });

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-1.5 text-[15px] font-bold text-ink">Notifications</div>
      {TOGGLE_DEFS.map((row) => {
        const on = toggles[row.key];
        return (
          <div key={row.key} className="flex items-center justify-between border-t border-divider py-3.5">
            <div>
              <div className="text-[13px] font-semibold text-ink">{row.label}</div>
              <div className="mt-0.5 text-xs text-ink/50">{row.sub}</div>
            </div>
            <div
              onClick={() => setToggles((s) => ({ ...s, [row.key]: !s[row.key] }))}
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
