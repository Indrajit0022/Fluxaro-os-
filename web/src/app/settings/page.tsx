"use client";

import { useState } from "react";

const TOGGLE_DEFS = [
  { key: "email", label: "Email Alerts", sub: "Pipeline activity and overdue proposals" },
  { key: "slack", label: "Slack Alerts", sub: "Post updates to #fluxaro-ops" },
  { key: "digest", label: "Weekly Digest", sub: "Summary every Monday morning" },
];

const TEAM = [
  { initial: "A", name: "Alex Rivera", role: "Owner" },
  { initial: "J", name: "Jamie Chen", role: "Operator" },
];

const INTEGRATIONS = [
  { name: "Google Calendar", status: "Connected", chipBg: "#EAF76A", chipColor: "#141414" },
  { name: "Slack", status: "Connected", chipBg: "#EAF76A", chipColor: "#141414" },
  { name: "Stripe", status: "Not Connected", chipBg: "#F4F3EF", chipColor: "rgba(20,20,20,0.5)" },
  { name: "HubSpot", status: "Not Connected", chipBg: "#F4F3EF", chipColor: "rgba(20,20,20,0.5)" },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState({ email: true, slack: false, digest: true });

  return (
    <>
      <div>
        <div className="text-[30px] font-bold text-ink">Settings</div>
        <div className="mt-1.5 text-sm text-ink/55">Workspace preferences</div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-1.5 text-[15px] font-bold text-ink">Notifications</div>
            {TOGGLE_DEFS.map((row) => {
              const on = toggles[row.key as keyof typeof toggles];
              return (
                <div key={row.key} className="flex items-center justify-between border-t border-divider py-3.5">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{row.label}</div>
                    <div className="mt-0.5 text-xs text-ink/50">{row.sub}</div>
                  </div>
                  <div
                    onClick={() =>
                      setToggles((s) => ({ ...s, [row.key]: !s[row.key as keyof typeof toggles] }))
                    }
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

          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-[15px] font-bold text-ink">Team</div>
              <div className="cursor-pointer text-xs font-semibold text-ink">+ Invite</div>
            </div>
            {TEAM.map((tm) => (
              <div key={tm.name} className="flex items-center gap-3 border-t border-divider py-3">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
                  {tm.initial}
                </div>
                <div className="min-w-0 flex-1 text-[13px] font-semibold text-ink">{tm.name}</div>
                <div className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink/60">
                  {tm.role}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] bg-white p-5">
            <div className="mb-1.5 text-[15px] font-bold text-ink">Integrations</div>
            {INTEGRATIONS.map((ig) => (
              <div key={ig.name} className="flex items-center justify-between border-t border-divider py-3.5">
                <div className="text-[13px] font-semibold text-ink">{ig.name}</div>
                <div
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: ig.chipBg, color: ig.chipColor }}
                >
                  {ig.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] bg-ink p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-[15px] font-bold text-ink">
              FX
            </div>
            <div className="mt-3.5 text-[15px] font-bold text-white">Fluxaro OS</div>
            <div className="mt-0.5 text-xs text-white/55">2 of 3 seats used</div>
          </div>
          <div className="rounded-[20px] bg-white p-5">
            <div className="text-[13px] font-semibold text-ink/55">Current Plan</div>
            <div className="mt-2 text-xl font-bold text-ink">Growth</div>
            <div className="mt-0.5 text-xs text-ink/50">$249/mo · Renews Sep 15, 2026</div>
            <button className="mt-4 w-full rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white hover:bg-[#2a2a2a]">
              Manage Billing
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
