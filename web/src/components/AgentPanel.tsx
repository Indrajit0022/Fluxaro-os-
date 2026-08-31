"use client";

import { AGENTS, useAgentPanel, type AgentKey } from "./AgentPanelContext";

export function AgentPanel() {
  const { open, activeAgent, closePanel, setActiveAgent } = useAgentPanel();
  const agent = AGENTS[activeAgent];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-slate-900/35"
          onClick={closePanel}
        />
      )}
      <div
        className="fixed top-4 bottom-4 z-20 flex w-[380px] flex-col rounded-[20px] bg-white shadow-[0_12px_48px_rgba(0,0,0,0.22)] transition-[right] duration-200 ease-out"
        style={{ right: open ? 16 : -420 }}
      >
        <div className="border-b border-slate-100 px-5 pt-5 pb-3">
          <div className="mb-3 text-base font-bold text-ink">Agents</div>
          <div className="flex gap-1.5">
            {(Object.keys(AGENTS) as AgentKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveAgent(key)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: activeAgent === key ? "#141414" : "#F1F5F9",
                  color: activeAgent === key ? "#fff" : "#64748B",
                }}
              >
                {AGENTS[key].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {agent.messages.map((m, i) => (
            <div
              key={i}
              className="max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={{
                alignSelf: m.align,
                background: m.align === "flex-end" ? "#141414" : "#F1F5F9",
                color: m.align === "flex-end" ? "#fff" : "#0F172A",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-3.5">
          <div className="rounded-xl bg-slate-100 px-3.5 py-2.5 text-[13px] text-slate-400">
            Message {agent.label}…
          </div>
        </div>
      </div>
    </>
  );
}
