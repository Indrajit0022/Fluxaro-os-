"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type AgentKey = "friday" | "proposal" | "content";

type Message = { align: "flex-end" | "flex-start"; text: string };

export const AGENTS: Record<AgentKey, { label: string; messages: Message[] }> = {
  friday: {
    label: "Friday",
    messages: [
      { align: "flex-end", text: "What's the status of Beacon Health?" },
      {
        align: "flex-start",
        text: "Proposal sent 3 days ago, no reply yet — it's overdue for follow-up. Want me to draft a nudge?",
      },
    ],
  },
  proposal: {
    label: "Proposal Agent",
    messages: [
      { align: "flex-end", text: "Draft a proposal for Vantage Legal from the audit notes." },
      {
        align: "flex-start",
        text: "Draft ready: scope, timeline, Growth Gap scores and pricing based on the audit. Review before sending.",
      },
    ],
  },
  content: {
    label: "Content Agent",
    messages: [
      { align: "flex-end", text: "Draft a LinkedIn post about the Solstice Retail win." },
      {
        align: "flex-start",
        text: "Here's a short post highlighting the Growth Gap results and timeline. Ready for your review.",
      },
    ],
  },
};

type AgentPanelState = {
  open: boolean;
  activeAgent: AgentKey;
  openPanel: (agent?: AgentKey) => void;
  closePanel: () => void;
  setActiveAgent: (agent: AgentKey) => void;
};

const AgentPanelCtx = createContext<AgentPanelState | null>(null);

export function AgentPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentKey>("friday");

  const value = useMemo<AgentPanelState>(
    () => ({
      open,
      activeAgent,
      openPanel: (agent) => {
        if (agent) setActiveAgent(agent);
        setOpen(true);
      },
      closePanel: () => setOpen(false),
      setActiveAgent,
    }),
    [open, activeAgent]
  );

  return <AgentPanelCtx.Provider value={value}>{children}</AgentPanelCtx.Provider>;
}

export function useAgentPanel() {
  const ctx = useContext(AgentPanelCtx);
  if (!ctx) throw new Error("useAgentPanel must be used within AgentPanelProvider");
  return ctx;
}
