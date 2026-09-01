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
  follow_up_date: string | null;
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
  follow_up_date?: string | null;
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

export const PAYMENT_STATUSES = ["pending", "received", "overdue"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  received: "Received",
  overdue: "Overdue",
};

export type Payment = {
  id: string;
  lead_id: string;
  project: string | null;
  milestone: string | null;
  amount: number;
  method: string | null;
  status: PaymentStatus;
  date_received: string | null;
  expected_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NewPaymentInput = {
  lead_id: string;
  project?: string;
  milestone?: string;
  amount: number;
  method?: string;
  status?: PaymentStatus;
  date_received?: string;
  expected_date?: string;
  notes?: string;
};

export const KNOWLEDGE_CATEGORIES = ["sop", "template", "reference", "client-notes"] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  sop: "SOP",
  template: "Template",
  reference: "Reference",
  "client-notes": "Client Notes",
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NewKnowledgeDocumentInput = {
  title: string;
  category: KnowledgeCategory;
  content: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  created_at: string;
};

export type NewTeamMemberInput = {
  name: string;
  role: string;
};

export type Integration = {
  id: string;
  name: string;
  connected: boolean;
  updated_at: string;
};

export type WorkspaceSettings = {
  id: true;
  email_alerts: boolean;
  slack_alerts: boolean;
  weekly_digest: boolean;
  updated_at: string;
};

export type WorkspaceSettingsPatch = Partial<
  Pick<WorkspaceSettings, "email_alerts" | "slack_alerts" | "weekly_digest">
>;

export type SocialAccount = {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  active: boolean;
  created_at: string;
};

export type NewSocialAccountInput = {
  platform: string;
  handle: string;
  url?: string;
};

export const CONTENT_STATUSES = ["idea", "drafted", "scheduled", "posted"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea",
  drafted: "Drafted",
  scheduled: "Scheduled",
  posted: "Posted",
};

export const CONTENT_PILLARS = [
  "business-thinking",
  "systems",
  "proof",
  "behind-the-scenes",
  "offers",
] as const;
export type ContentPillar = (typeof CONTENT_PILLARS)[number];

export const CONTENT_PILLAR_LABELS: Record<ContentPillar, string> = {
  "business-thinking": "Business Thinking",
  systems: "Systems",
  proof: "Proof / Transformations",
  "behind-the-scenes": "Behind the Scenes",
  offers: "Offers",
};

export type SocialPost = {
  id: string;
  account_id: string | null;
  title: string;
  content: string | null;
  pillar: ContentPillar | null;
  status: ContentStatus;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
};

export type NewSocialPostInput = {
  account_id?: string | null;
  title: string;
  content?: string;
  pillar?: ContentPillar;
  status?: ContentStatus;
  scheduled_date?: string;
};

export const MEMBERS = ["indrajit", "aditya"] as const;
export type Member = (typeof MEMBERS)[number];

export const MEMBER_LABELS: Record<Member, string> = {
  indrajit: "Indrajit",
  aditya: "Aditya",
};

export type DailyChecklistItem = {
  id: string;
  label: string;
  created_at: string;
};

export type DailyChecklistEntry = {
  id: string;
  item_id: string;
  member: Member;
  date: string;
  checked: boolean;
  updated_at: string;
};

export type DailyTask = {
  id: string;
  member: Member;
  date: string;
  text: string;
  done: boolean;
  created_at: string;
};

export type NewDailyTaskInput = {
  member: Member;
  date: string;
  text: string;
};

export type StickyNote = {
  id: string;
  author: Member;
  text: string;
  created_at: string;
};

export type NewStickyNoteInput = {
  author: Member;
  text: string;
};
