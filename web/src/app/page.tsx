import Link from "next/link";
import Image from "next/image";
import { listLeads } from "@/lib/leads";
import { capsules, formatCurrency } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { OpenAgentsButton } from "@/components/OpenAgentsButton";
import { StickyNotesWidget } from "@/components/StickyNotesWidget";

// Reads live lead data on every request — never prerendered at build time.
export const dynamic = "force-dynamic";

const ICON_CLIENTS =
  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>';
const ICON_PROPOSALS =
  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>';
const ICON_PLAYBOOK =
  '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>';
const ICON_DOCS =
  '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>';
const ICON_CASE_STUDIES =
  '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>';
const ICON_DEAL = '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"></path>';

const TABS = [
  { label: "Overview", href: "/" },
  { label: "Clients", href: "/clients" },
  { label: "Proposals", href: "/proposals" },
  { label: "Cashflow", href: "/cashflow" },
  { label: "Analytics", href: "/analytics" },
];

// Illustrative 8-day deal/revenue trend — Fluxaro OS doesn't track daily
// pipeline snapshots yet, so this stays representative until that history exists.
const CHART_DATA = [
  { label: "19 Aug", deals: 42, rev: 30 },
  { label: "20 Aug", deals: 32, rev: 55 },
  { label: "21 Aug", deals: 58, rev: 40 },
  { label: "22 Aug", deals: 25, rev: 18 },
  { label: "23 Aug", deals: 78, rev: 46, badge: "87%" },
  { label: "24 Aug", deals: 20, rev: 62, badge: "32%" },
  { label: "25 Aug", deals: 50, rev: 34 },
  { label: "26 Aug", deals: 44, rev: 52 },
];

export default async function CommandCenterPage() {
  const leads = await listLeads();
  const activeDeals = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const inDiscovery = leads.filter((l) => l.stage === "discovery").length;
  const proposalsOut = leads.filter((l) => l.stage === "proposal_sent");
  const proposalsValue = proposalsOut.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);

  const activeDealsPct =
    leads.length > 0 ? Math.round((activeDeals.length / leads.length) * 100) : 0;
  const proposalsPct = leads.length > 0 ? Math.round((proposalsOut.length / leads.length) * 100) : 0;

  const statCards = [
    {
      label: "Active Deals",
      value: String(activeDeals.length),
      pct: `${activeDealsPct}%`,
      sub: `${inDiscovery} in discovery`,
      bg: "#fff",
      iconBg: "#F4F3EF",
      iconHtml: ICON_DEAL,
      filled: Math.min(8, Math.round((activeDealsPct / 100) * 8)),
    },
    {
      label: "Proposals Out",
      value: formatCurrency(proposalsValue),
      pct: `${proposalsPct}%`,
      sub: `${proposalsOut.length} awaiting reply`,
      bg: "#EAF76A",
      iconBg: "rgba(20,20,20,0.08)",
      iconHtml: ICON_PROPOSALS,
      filled: Math.min(8, Math.round((proposalsPct / 100) * 8)),
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="text-[38px] font-bold leading-[1.16] text-ink">
          <div>
            Running
            <span className="mx-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-white align-middle">
              <Icon paths={ICON_CLIENTS} color="#141414" size={15} />
            </span>
            Your Clients
          </div>
          <div>
            and
            <span className="mx-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-lime align-middle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#141414">
                <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
              </svg>
            </span>
            Proposals
          </div>
        </div>
        <div className="mt-1.5 flex flex-none items-center gap-2.5">
          <OpenAgentsButton />
          <Link
            href="/clients"
            className="flex-none whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]"
          >
            + New Deal
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-full px-[18px] py-2.5 text-[13px] font-medium"
            style={
              t.label === "Overview"
                ? { background: "#141414", color: "#fff" }
                : { background: "#fff", color: "#141414", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="min-w-0 flex-1 rounded-[20px] p-[18px]"
                style={{ background: card.bg }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
                      style={{ background: card.iconBg }}
                    >
                      <Icon paths={card.iconHtml} color="#141414" size={14} />
                    </div>
                    <div className="whitespace-nowrap text-[13px] font-semibold text-ink">
                      {card.label}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold tracking-widest text-ink/40">•••</div>
                </div>
                <div className="mt-4 flex flex-wrap items-baseline gap-2">
                  <div className="flex-none whitespace-nowrap text-[28px] font-bold text-ink">
                    {card.value}
                  </div>
                  <div className="flex flex-none items-center gap-1 whitespace-nowrap rounded-full bg-ink/8 px-2 py-1 text-[11px] font-semibold text-ink">
                    {card.pct}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="3">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </div>
                </div>
                <div className="mt-0.5 text-[11px] text-ink/55">{card.sub}</div>
                <div className="mt-3.5 flex gap-[3px]">
                  {capsules(card.filled, 8).map((c, i) => (
                    <div
                      key={i}
                      className="h-[30px] flex-1 rounded-full"
                      style={{
                        background: c.filled ? "#141414" : "transparent",
                        border: c.filled ? "none" : "1px dashed rgba(20,20,20,0.25)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex min-h-[150px] items-center gap-5 overflow-hidden rounded-[20px] bg-ink p-6">
            <div className="absolute inset-0">
              <Image
                src="/promo-agents.png"
                alt=""
                fill
                className="object-cover opacity-70"
              />
            </div>
            <div className="relative min-w-0 flex-1">
              <div className="whitespace-nowrap text-lg font-bold text-white">
                Put Your Agents to Work <span className="text-[15px]">↗</span>
              </div>
              <div className="mt-2.5 text-[13px] leading-relaxed text-white/65">
                Deploy AI agents, automate workflows,
                <br />
                and get real work done.
              </div>
            </div>
            <OpenAgentsButton variant="promo" />
          </div>

          <div className="rounded-[20px] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <div className="text-base font-bold text-ink">Statistics</div>
                <div className="ml-2.5 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
                  <span className="text-xs text-ink/60">Deals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime" />
                  <span className="text-xs text-ink/60">Revenue</span>
                </div>
              </div>
              <div className="rounded-full bg-panel px-3.5 py-1.5 text-xs font-medium text-ink">
                2026 ⌄
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between px-1">
              {CHART_DATA.map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-2.5">
                  {d.badge ? (
                    <div className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {d.badge}
                    </div>
                  ) : (
                    <div className="h-[21px]" />
                  )}
                  <div className="flex h-[130px] items-end gap-1.5">
                    <div className="relative h-[130px] w-[11px] rounded-full bg-[#EDEDE6]">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-full bg-ink"
                        style={{ height: `${d.deals}%` }}
                      />
                      <div
                        className="absolute left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-ink bg-white"
                        style={{ bottom: `${d.deals}%`, marginBottom: -6 }}
                      />
                    </div>
                    <div className="relative h-[130px] w-[11px] rounded-full bg-[#EDEDE6]">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-full bg-lime"
                        style={{ height: `${d.rev}%` }}
                      />
                      <div
                        className="absolute left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-ink bg-white"
                        style={{ bottom: `${d.rev}%`, marginBottom: -6 }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-ink/55">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex min-w-0 gap-3">
            <Link
              href="/knowledge"
              className="flex aspect-square flex-1 flex-col items-center justify-center gap-2 rounded-[18px] bg-white hover:bg-[#EFEFE9]"
            >
              <Icon paths={ICON_PLAYBOOK} color="#141414" size={20} />
              <div className="text-xs font-semibold text-ink">Playbook</div>
            </Link>
            <Link
              href="/knowledge"
              className="flex aspect-square flex-1 flex-col items-center justify-center gap-2 rounded-[18px] bg-white hover:bg-[#EFEFE9]"
            >
              <Icon paths={ICON_DOCS} color="#141414" size={20} />
              <div className="text-xs font-semibold text-ink">Docs</div>
            </Link>
          </div>

          {[
            { title: "Help Center", sub: "Setup and workflow questions", href: "/knowledge", icon: ICON_DOCS },
            { title: "Client Directory", sub: "Every active and past relationship", href: "/clients", icon: ICON_CLIENTS },
            { title: "Playbook", sub: "SOPs for running engagements", href: "/knowledge", icon: ICON_PLAYBOOK },
            { title: "Case Studies", sub: "How past engagements were scoped", href: "/analytics", icon: ICON_CASE_STUDIES },
          ].map((l) => (
            <Link
              key={l.title}
              href={l.href}
              className="rounded-2xl bg-white px-4 py-3.5 hover:bg-[#FCFCFA]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-panel">
                  <Icon paths={l.icon} color="#141414" size={14} />
                </div>
                <div className="text-ink/35">↗</div>
              </div>
              <div className="mt-2.5 text-[13px] font-bold text-ink">{l.title}</div>
              <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-ink/50">
                {l.sub}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <StickyNotesWidget />
    </>
  );
}
