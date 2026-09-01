import { listSocialAccounts, listSocialPosts } from "@/lib/social";
import { SocialAccountsSection } from "@/components/SocialAccountsSection";
import { SocialPostsList } from "@/components/SocialPostsList";
import { NewSocialPostModal } from "@/components/NewSocialPostModal";

export const dynamic = "force-dynamic";

export default async function SocialPage() {
  const [accounts, posts] = await Promise.all([listSocialAccounts(), listSocialPosts()]);

  const accountLabelById = Object.fromEntries(
    accounts.map((a) => [a.id, `${a.platform} · ${a.handle}`])
  );
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const postedCount = posts.filter((p) => p.status === "posted").length;
  const ideaCount = posts.filter((p) => p.status === "idea" || p.status === "drafted").length;

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Social Media</div>
          <div className="mt-1.5 text-sm text-ink/55">Fluxaro&apos;s own accounts and content calendar</div>
        </div>
        <NewSocialPostModal
          trigger={
            <button className="flex-none cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
              + New Post
            </button>
          }
        />
      </div>

      <div className="mt-5 flex items-stretch gap-4">
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">In the Pipeline</div>
          <div className="text-[26px] font-bold text-ink">{ideaCount}</div>
          <div className="text-[11px] text-ink/50">Ideas &amp; drafts</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-white p-5">
          <div className="text-[13px] font-medium text-ink/60">Scheduled</div>
          <div className="text-[26px] font-bold text-ink">{scheduledCount}</div>
          <div className="text-[11px] text-ink/50">Ready to publish</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[20px] bg-ink p-5">
          <div className="text-[13px] font-medium text-white/60">Posted</div>
          <div className="text-[26px] font-bold text-white">{postedCount}</div>
          <div className="text-[11px] text-white/50">Total published</div>
        </div>
      </div>

      <div className="mt-4">
        <SocialAccountsSection accounts={accounts} />
      </div>

      <div className="mt-5 text-[15px] font-bold text-ink">Content Calendar</div>
      <SocialPostsList posts={posts} accountLabelById={accountLabelById} />
    </>
  );
}
