// Fluxaro's fixed product catalog — six Operating Systems, each with three
// pricing tiers. This is configuration, not per-record data, so it lives in
// app code rather than the database. Source: fluxaro-pricing-guide.md /
// all-operating-systems.md.

export const OS_TIERS = ["starter", "growth", "enterprise"] as const;
export type OsTier = (typeof OS_TIERS)[number];

export const PILLARS = ["demand", "revenue", "operations", "customer", "intelligence"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_LABELS: Record<Pillar, string> = {
  demand: "Demand",
  revenue: "Revenue",
  operations: "Operations",
  customer: "Customer",
  intelligence: "Intelligence",
};

export type OperatingSystemKey =
  | "revenue"
  | "lead-generation"
  | "operations"
  | "customer-success"
  | "intelligence"
  | "social";

export type OperatingSystem = {
  key: OperatingSystemKey;
  name: string;
  purpose: string;
  timeline: string;
  pillar: Pillar | null;
  pricing: Record<Exclude<OsTier, "enterprise">, { min: number; max: number }>;
};

export const OPERATING_SYSTEMS: Record<OperatingSystemKey, OperatingSystem> = {
  revenue: {
    key: "revenue",
    name: "Revenue OS",
    purpose: "Automate and optimize everything after a lead enters the business.",
    timeline: "3–6 weeks",
    pillar: "revenue",
    pricing: { starter: { min: 1500, max: 2500 }, growth: { min: 3000, max: 6000 } },
  },
  "lead-generation": {
    key: "lead-generation",
    name: "Lead Generation OS",
    purpose: "Create a predictable, scalable system for acquiring qualified leads.",
    timeline: "2–5 weeks",
    pillar: "demand",
    pricing: { starter: { min: 1500, max: 2500 }, growth: { min: 3000, max: 6000 } },
  },
  operations: {
    key: "operations",
    name: "Operations OS",
    purpose: "Streamline internal operations and replace fragmented manual processes.",
    timeline: "3–8 weeks",
    pillar: "operations",
    pricing: { starter: { min: 2000, max: 3000 }, growth: { min: 4000, max: 7000 } },
  },
  "customer-success": {
    key: "customer-success",
    name: "Customer Success OS",
    purpose: "Optimize the post-sale client journey — onboarding, support, retention.",
    timeline: "2–6 weeks",
    pillar: "customer",
    pricing: { starter: { min: 2000, max: 3000 }, growth: { min: 4000, max: 7000 } },
  },
  intelligence: {
    key: "intelligence",
    name: "Intelligence OS",
    purpose: "Transform business data into one unified, actionable source of truth.",
    timeline: "2–5 weeks",
    pillar: "intelligence",
    pricing: { starter: { min: 2000, max: 3500 }, growth: { min: 4000, max: 7500 } },
  },
  social: {
    key: "social",
    name: "Social OS",
    purpose: "Build brand authority and generate inbound opportunities through content.",
    timeline: "2–4 weeks",
    pillar: null,
    pricing: { starter: { min: 1500, max: 2500 }, growth: { min: 3000, max: 5500 } },
  },
};

export const PILLAR_TO_OS: Record<Pillar, OperatingSystemKey> = {
  demand: "lead-generation",
  revenue: "revenue",
  operations: "operations",
  customer: "customer-success",
  intelligence: "intelligence",
};

export const RETAINER_TIERS = [
  { name: "Essential", price: 297 },
  { name: "Growth", price: 597 },
  { name: "Scale", price: 997 },
];

// Enterprise tier is always a custom quote — no range to suggest a default from.
export function suggestPrice(osKey: OperatingSystemKey, tier: OsTier): number | null {
  if (tier === "enterprise") return null;
  const range = OPERATING_SYSTEMS[osKey].pricing[tier];
  return Math.round((range.min + range.max) / 2);
}
