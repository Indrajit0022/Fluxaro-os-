"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Integration } from "@/lib/types";

export function IntegrationsSection({ integrations }: { integrations: Integration[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(integration: Integration) {
    setBusyId(integration.id);
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connected: !integration.connected }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-[20px] bg-white p-5">
      <div className="mb-1.5 text-[15px] font-bold text-ink">Integrations</div>
      <div className="mb-2 text-xs text-ink/45">
        Manual status — flip once you&apos;ve actually connected something externally.
      </div>
      {integrations.map((ig) => (
        <div key={ig.id} className="flex items-center justify-between border-t border-divider py-3.5">
          <div className="text-[13px] font-semibold text-ink">{ig.name}</div>
          <button
            onClick={() => toggle(ig)}
            disabled={busyId === ig.id}
            className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
            style={{
              background: ig.connected ? "#EAF76A" : "#F4F3EF",
              color: ig.connected ? "#141414" : "rgba(20,20,20,0.5)",
            }}
          >
            {ig.connected ? "Connected" : "Not Connected"}
          </button>
        </div>
      ))}
    </div>
  );
}
