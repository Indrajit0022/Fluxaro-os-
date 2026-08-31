import "server-only";
import { supabaseServer } from "./supabase-server";
import type { NewProposalInput, Proposal, ProposalStatus } from "./types";

export async function listProposals(): Promise<Proposal[]> {
  const { data, error } = await supabaseServer
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Proposal[];
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const { data, error } = await supabaseServer
    .from("proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Proposal | null;
}

export async function listProposalsForLead(leadId: string): Promise<Proposal[]> {
  const { data, error } = await supabaseServer
    .from("proposals")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Proposal[];
}

async function logActivity(leadId: string, detail: string): Promise<void> {
  const { error } = await supabaseServer
    .from("lead_activity")
    .insert({ lead_id: leadId, type: "note", detail });
  if (error) throw new Error(error.message);
}

export async function createProposal(input: NewProposalInput): Promise<Proposal> {
  const { data, error } = await supabaseServer
    .from("proposals")
    .insert({
      lead_id: input.lead_id,
      audit_id: input.audit_id ?? null,
      recommended_os: input.recommended_os,
      tier: input.tier ?? null,
      price: input.price ?? null,
      executive_summary: input.executive_summary ?? null,
      scope_notes: input.scope_notes ?? null,
      exclusions: input.exclusions ?? null,
      timeline_weeks_min: input.timeline_weeks_min ?? null,
      timeline_weeks_max: input.timeline_weeks_max ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const proposal = data as Proposal;
  await logActivity(input.lead_id, "Proposal drafted");
  return proposal;
}

export async function updateProposal(
  id: string,
  patch: Partial<NewProposalInput>
): Promise<Proposal> {
  const { data, error } = await supabaseServer
    .from("proposals")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const proposal = data as Proposal;
  await logActivity(proposal.lead_id, "Proposal updated");
  return proposal;
}

const STATUS_TRANSITION_DETAIL: Record<ProposalStatus, string> = {
  draft: "Proposal moved back to draft",
  approved: "Proposal approved for sending",
  sent: "Proposal sent to client",
  won: "Proposal won",
  lost: "Proposal lost",
};

export async function setProposalStatus(id: string, status: ProposalStatus): Promise<Proposal> {
  const patch: Record<string, unknown> = { status };
  if (status === "sent") patch.sent_at = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("proposals")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const proposal = data as Proposal;
  await logActivity(proposal.lead_id, STATUS_TRANSITION_DETAIL[status]);

  // Keep the lead's own pipeline stage roughly in sync with its proposal.
  if (status === "sent") {
    await supabaseServer.from("leads").update({ stage: "proposal_sent" }).eq("id", proposal.lead_id);
  } else if (status === "won") {
    await supabaseServer.from("leads").update({ stage: "won" }).eq("id", proposal.lead_id);
  } else if (status === "lost") {
    await supabaseServer.from("leads").update({ stage: "lost" }).eq("id", proposal.lead_id);
  }

  return proposal;
}
