export const PIPELINE_STAGES = [
  "new",
  "qualified",
  "discovery",
  "audit",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "New",
  qualified: "Qualified",
  discovery: "Discovery",
  audit: "Audit",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export type Lead = {
  id: string;
  company: string;
  contact_name: string | null;
  source: string | null;
  icp_score: number | null;
  stage: PipelineStage;
  discovery_notes: string | null;
  growth_gap_score: number | null;
  next_action: string | null;
  deal_value: number | null;
  created_at: string;
  updated_at: string;
};

export type NewLeadInput = {
  company: string;
  contact_name?: string;
  source?: string;
  icp_score?: number;
  stage?: PipelineStage;
  discovery_notes?: string;
  growth_gap_score?: number;
  next_action?: string;
  deal_value?: number;
};

export type ActivityType = "created" | "stage_change" | "updated" | "note";

export type LeadActivity = {
  id: string;
  lead_id: string;
  type: ActivityType;
  detail: string;
  created_at: string;
};
