import { listLeads } from "@/lib/leads";
import { listProposals } from "@/lib/proposals";
import { formatCurrency } from "@/lib/format";
import { NewProposalModal } from "@/components/NewProposalModal";
import { ProposalsList } from "@/components/ProposalsList";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const [proposals, leads] = await Promise.all([listProposals(), listLeads()]);
  const companyByLeadId = Object.fromEntries(leads.map((l) => [l.id, l.company]));

  const sentOrLater = proposals.filter((p) => p.status !== "draft" && p.status !== "approved");
  const won = proposals.filter((p) => p.status === "won").length;
  const lost = proposals.filter((p) => p.status === "lost").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
  const pipelineValue = proposals
    .filter((p) => p.status === "draft" || p.status === "approved" || p.status === "sent")
    .reduce((sum, p) => sum + (p.price ?? 0), 0);

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Proposals</div>
          <div className="mt-1.5 text-sm text-ink/55">Track everything sent, signed, or stalled</div>
        </div>
        <NewProposalModal
          trigger={
            <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
              + New Proposal
            </button>
          }
        />
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Pipeline Value</div>
          <div className="text-[26px] font-bold text-ink">{formatCurrency(pipelineValue)}</div>
          <div className="text-[11px] text-ink/50">Draft, approved &amp; sent</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
          <div className="text-[13px] font-medium text-white/60">Proposals Sent</div>
          <div className="text-[26px] font-bold text-white">{sentOrLater.length}</div>
          <div className="text-[11px] text-white/50">Sent, won or lost</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Win Rate</div>
          <div className="text-[26px] font-bold text-ink">{winRate}%</div>
          <div className="text-[11px] text-ink/50">Of closed proposals</div>
        </div>
      </div>

      <ProposalsList proposals={proposals} companyByLeadId={companyByLeadId} />
    </>
  );
}
