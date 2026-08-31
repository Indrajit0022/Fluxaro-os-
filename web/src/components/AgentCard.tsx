"use client";

import { useAgentPanel, type AgentKey } from "./AgentPanelContext";
import { capsules } from "@/lib/format";

export function AgentCard({
  agentKey,
  name,
  role,
  desc,
  filled,
}: {
  agentKey: AgentKey;
  name: string;
  role: string;
  desc: string;
  filled: number;
}) {
  const { openPanel } = useAgentPanel();

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-lime">
          {name.charAt(0)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="text-[11px] font-semibold text-ink/50">Online</span>
        </div>
      </div>
      <div>
        <div className="text-[15px] font-bold text-ink">{name}</div>
        <div className="mt-0.5 text-[11px] font-semibold text-ink/50">{role}</div>
      </div>
      <div className="flex-1 text-xs leading-relaxed text-ink/60">{desc}</div>
      <div className="flex gap-[3px]">
        {capsules(filled, 8).map((c, i) => (
          <div
            key={i}
            className="h-[22px] flex-1 rounded-full"
            style={{
              background: c.filled ? "#141414" : "transparent",
              border: c.filled ? "none" : "1px dashed rgba(20,20,20,0.25)",
            }}
          />
        ))}
      </div>
      <button
        onClick={() => openPanel(agentKey)}
        className="cursor-pointer rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white hover:bg-[#2a2a2a]"
      >
        Open {name}
      </button>
    </div>
  );
}
