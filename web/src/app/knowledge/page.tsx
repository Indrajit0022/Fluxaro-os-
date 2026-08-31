import { Icon } from "@/components/Icon";

const ICON_CHECK = '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>';
const ICON_DOC = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
const ICON_PROPOSAL = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>';
const ICON_CHART = '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>';
const ICON_PEOPLE = '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>';
const ICON_MONEY = '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>';

const ARTICLES = [
  { title: "Client Onboarding Checklist", desc: "Steps for kicking off a new engagement", date: "Aug 24, 2026", source: "via Notion", icon: ICON_CHECK },
  { title: "Discovery Call Script", desc: "Questions to run every first call", date: "Aug 20, 2026", source: "via Docs", icon: ICON_DOC },
  { title: "Proposal Template Guide", desc: "How to structure scope and pricing", date: "Aug 18, 2026", source: "via Notion", icon: ICON_PROPOSAL },
  { title: "Audit Framework", desc: "Growth Gap scoring methodology", date: "Aug 14, 2026", source: "via Docs", icon: ICON_CHART },
  { title: "Handoff Runbook", desc: "Moving a signed client into delivery", date: "Aug 9, 2026", source: "via Notion", icon: ICON_PEOPLE },
  { title: "Pricing Guidelines", desc: "Standard rates and discount limits", date: "Aug 2, 2026", source: "via Sheets", icon: ICON_MONEY },
];

const MESSAGES = [
  { align: "flex-end" as const, text: "What does the pricing guideline say about discounts?" },
  {
    align: "flex-start" as const,
    text: "Standard discount cap is 10% for multi-quarter retainers. Anything beyond that needs sign-off. Want the full doc?",
  },
];

export default function KnowledgePage() {
  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Knowledge Base</div>
          <div className="mt-1.5 text-sm text-ink/55">Playbooks, SOPs and templates for running engagements</div>
        </div>
        <button className="flex-none whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
          + New Doc
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-full bg-ink px-5 py-3.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#EAF76A">
          <path d="M12 2l1.6 4.8L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.2z" />
        </svg>
        <div className="flex-1 text-sm text-white/50">Search the knowledge base</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[13px] text-ink/55">
          Showing <span className="font-bold text-ink">{ARTICLES.length}</span> documents
        </div>
        <div className="flex gap-2">
          <div className="rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink">Filter</div>
          <div className="rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink">Newest first ⌄</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          {ARTICLES.map((a) => (
            <div
              key={a.title}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-[18px] bg-white p-[18px] hover:bg-[#FCFCFA]"
            >
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-panel">
                  <Icon paths={a.icon} color="#141414" size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink">{a.title}</div>
                  <div className="mt-1 text-xs leading-snug text-ink/55">{a.desc}</div>
                </div>
              </div>
              <div className="flex-none whitespace-nowrap text-right text-[11px] text-ink/40">
                {a.date}
                <br />
                {a.source}
              </div>
            </div>
          ))}
        </div>

        <div className="flex h-[520px] flex-col rounded-[20px] bg-white">
          <div className="flex items-center justify-between border-b border-divider px-[18px] pt-[18px] pb-3.5">
            <div className="text-[15px] font-bold text-ink">Ask Friday</div>
            <div className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink">
              New Chat
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-[18px] py-4">
            {MESSAGES.map((m, i) => (
              <div
                key={i}
                className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                style={{
                  alignSelf: m.align,
                  background: m.align === "flex-end" ? "#141414" : "#F4F3EF",
                  color: m.align === "flex-end" ? "#fff" : "#141414",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="border-t border-divider px-[18px] py-3.5">
            <div className="rounded-xl bg-panel px-3.5 py-2.5 text-sm text-ink/40">
              Ask about a playbook or SOP…
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
