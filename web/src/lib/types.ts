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

export const EVIDENCE_TYPES = ["verified", "reported", "inferred", "unknown"] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  verified: "Verified",
  reported: "Reported",
  inferred: "Inferred",
  unknown: "Unknown",
};

export type PillarKey = "demand" | "revenue" | "operations" | "customer" | "intelligence";

export type PillarInput = {
  score: number | null;
  evidence_type: EvidenceType | null;
  evidence: string | null;
};

export type Audit = {
  id: string;
  lead_id: string;
  demand_score: number | null;
  demand_evidence_type: EvidenceType | null;
  demand_evidence: string | null;
  revenue_score: number | null;
  revenue_evidence_type: EvidenceType | null;
  revenue_evidence: string | null;
  operations_score: number | null;
  operations_evidence_type: EvidenceType | null;
  operations_evidence: string | null;
  customer_score: number | null;
  customer_evidence_type: EvidenceType | null;
  customer_evidence: string | null;
  intelligence_score: number | null;
  intelligence_evidence_type: EvidenceType | null;
  intelligence_evidence: string | null;
  primary_bottleneck: PillarKey | null;
  business_impact: string | null;
  notes: string | null;
  created_at: string;
};

export type NewAuditInput = {
  lead_id: string;
  demand: PillarInput;
  revenue: PillarInput;
  operations: PillarInput;
  customer: PillarInput;
  intelligence: PillarInput;
  primary_bottleneck: PillarKey | null;
  business_impact?: string;
  notes?: string;
};

export const PROPOSAL_STATUSES = ["draft", "approved", "sent", "won", "lost"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  sent: "Sent",
  won: "Won",
  lost: "Lost",
};

export type Proposal = {
  id: string;
  lead_id: string;
  audit_id: string | null;
  status: ProposalStatus;
  recommended_os: string[];
  tier: "starter" | "growth" | "enterprise" | null;
  price: number | null;
  executive_summary: string | null;
  scope_notes: string | null;
  exclusions: string | null;
  timeline_weeks_min: number | null;
  timeline_weeks_max: number | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewProposalInput = {
  lead_id: string;
  audit_id?: string | null;
  recommended_os: string[];
  tier?: "starter" | "growth" | "enterprise";
  price?: number;
  executive_summary?: string;
  scope_notes?: string;
  exclusions?: string;
  timeline_weeks_min?: number;
  timeline_weeks_max?: number;
};
