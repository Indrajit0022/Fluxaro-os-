"use client";

import { useAgentPanel } from "./AgentPanelContext";

export function OpenAgentsButton({ variant = "icon" }: { variant?: "icon" | "promo" }) {
  const { openPanel } = useAgentPanel();

  if (variant === "promo") {
    return (
      <button
        onClick={() => openPanel()}
        className="relative flex flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-ink hover:bg-lime"
      >
        Open Agents <span>▷</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => openPanel()}
      className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
