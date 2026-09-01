import "server-only";
import { supabaseServer } from "./supabase-server";
import { STAGE_LABELS } from "./types";
import type { Lead, LeadActivity, NewLeadInput, PipelineStage } from "./types";

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabaseServer
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Lead[];
}

export async function listLeadsWithFollowUp(): Promise<Lead[]> {
  const { data, error } = await supabaseServer
    .from("leads")
    .select("*")
    .not("follow_up_date", "is", null)
    .order("follow_up_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Lead | null;
}

export async function listActivity(leadId: string): Promise<LeadActivity[]> {
  const { data, error } = await supabaseServer
    .from("lead_activity")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as LeadActivity[];
}

async function logActivity(
  leadId: string,
  type: LeadActivity["type"],
  detail: string
): Promise<void> {
  const { error } = await supabaseServer
    .from("lead_activity")
    .insert({ lead_id: leadId, type, detail });
  if (error) throw new Error(error.message);
}

export async function createLead(input: NewLeadInput): Promise<Lead> {
  const { data, error } = await supabaseServer
    .from("leads")
    .insert({
      company: input.company,
      contact_name: input.contact_name ?? null,
      source: input.source ?? null,
      icp_score: input.icp_score ?? null,
      stage: input.stage ?? "new",
      discovery_notes: input.discovery_notes ?? null,
      growth_gap_score: input.growth_gap_score ?? null,
      next_action: input.next_action ?? null,
      deal_value: input.deal_value ?? null,
      follow_up_date: input.follow_up_date ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const lead = data as Lead;
  await logActivity(lead.id, "created", `Lead created for ${lead.company}`);
  return lead;
}

const EDITABLE_FIELD_LABELS: Record<keyof NewLeadInput, string> = {
  company: "Company",
  contact_name: "Contact",
  source: "Source",
  icp_score: "ICP score",
  stage: "Stage",
  discovery_notes: "Discovery notes",
  growth_gap_score: "Growth Gap score",
  next_action: "Next action",
  deal_value: "Deal value",
  follow_up_date: "Follow-up date",
};

export async function updateLead(
  id: string,
  patch: Partial<NewLeadInput> & { stage?: PipelineStage }
): Promise<Lead> {
  const before = await getLead(id);

  const { data, error } = await supabaseServer
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const lead = data as Lead;

  if (before) {
    if (patch.stage && patch.stage !== before.stage) {
      await logActivity(
        id,
        "stage_change",
        `Stage changed from ${STAGE_LABELS[before.stage]} to ${STAGE_LABELS[patch.stage]}`
      );
    }
    const otherChanged = (Object.keys(patch) as (keyof NewLeadInput)[]).filter(
      (key) => key !== "stage" && patch[key] !== undefined && patch[key] !== before[key]
    );
    if (otherChanged.length > 0) {
      const labels = otherChanged.map((key) => EDITABLE_FIELD_LABELS[key]).join(", ");
      await logActivity(id, "updated", `Updated: ${labels}`);
    }
  }

  return lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabaseServer.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
