import { listKnowledgeDocuments } from "@/lib/knowledge";
import { KnowledgeList } from "@/components/KnowledgeList";
import { NewDocumentModal } from "@/components/NewDocumentModal";

export const dynamic = "force-dynamic";

const MESSAGES = [
  { align: "flex-end" as const, text: "What does the pricing guideline say about discounts?" },
  {
    align: "flex-start" as const,
    text: "Standard discount cap is 10% for multi-quarter retainers. Anything beyond that needs sign-off. Want the full doc?",
  },
];

export default async function KnowledgePage() {
  const documents = await listKnowledgeDocuments();

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Knowledge Base</div>
          <div className="mt-1.5 text-sm text-ink/55">Playbooks, SOPs and templates for running engagements</div>
        </div>
        <NewDocumentModal
          trigger={
            <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
              + New Doc
            </button>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="min-w-0">
          <KnowledgeList documents={documents} />
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
