import { AgentCard } from "@/components/AgentCard";

const STATS = [
  { label: "Active Agents", value: "3", sub: "All online", bg: "#141414", color: "#fff", subColor: "rgba(255,255,255,0.5)" },
  { label: "Automations Run", value: "128", sub: "This month", bg: "#EAF76A", color: "#141414", subColor: "rgba(20,20,20,0.55)" },
  { label: "Time Saved", value: "34 hrs", sub: "Estimated this month", bg: "#fff", color: "#141414", subColor: "rgba(20,20,20,0.5)" },
];

const AGENTS = [
  { key: "friday" as const, name: "Friday", role: "OPS ASSISTANT", desc: "Tracks follow-ups, flags overdue deals, keeps the pipeline honest.", filled: 6 },
  { key: "proposal" as const, name: "Proposal Agent", role: "DRAFTING", desc: "Turns audit notes into a scoped proposal with pricing.", filled: 4 },
  { key: "content" as const, name: "Content Agent", role: "MARKETING", desc: "Drafts posts and case studies from closed-won work.", filled: 2 },
];

const ACTIVITY = [
  { label: "Friday flagged Beacon Health", sub: "Follow-up overdue", time: "12 minutes ago", initial: "F" },
  { label: "Proposal Agent drafted Vantage Legal scope", sub: "Ready for review", time: "1 hour ago", initial: "P" },
  { label: "Content Agent posted case study", sub: "Solstice Retail win", time: "3 hours ago", initial: "C" },
  { label: "Friday nudged Corven Manufacturing", sub: "Redline reminder sent", time: "Yesterday", initial: "F" },
];

export default function AgentsPage() {
  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Agents</div>
          <div className="mt-1.5 text-sm text-ink/55">Your AI teammates</div>
        </div>
        <button className="flex-none whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
          + New Agent
        </button>
      </div>

      <div className="mt-5 flex gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="min-w-0 flex-1 rounded-[20px] p-[18px]" style={{ background: s.bg }}>
            <div className="text-[13px] font-semibold opacity-75" style={{ color: s.color }}>
              {s.label}
            </div>
            <div className="mt-2.5 text-[26px] font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="mt-0.5 text-xs" style={{ color: s.subColor }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {AGENTS.map((a) => (
          <AgentCard key={a.key} agentKey={a.key} name={a.name} role={a.role} desc={a.desc} filled={a.filled} />
        ))}
      </div>

      <div className="mt-4 rounded-[20px] bg-white p-5">
        <div className="mb-2.5 text-[15px] font-bold text-ink">Recent Agent Activity</div>
        {ACTIVITY.map((act, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-divider py-3">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">
              {act.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink">{act.label}</div>
              <div className="mt-px text-xs text-ink/50">{act.sub}</div>
            </div>
            <div className="flex-none whitespace-nowrap text-xs text-ink/40">{act.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
