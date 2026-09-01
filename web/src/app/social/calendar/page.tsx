import { listSocialAccounts, listSocialPosts } from "@/lib/social";
import { ContentCalendarView } from "@/components/ContentCalendarView";
import { NewSocialPostModal } from "@/components/NewSocialPostModal";
import { BulkAddPostsModal } from "@/components/BulkAddPostsModal";

export const dynamic = "force-dynamic";

export default async function ContentCalendarPage() {
  const [accounts, posts] = await Promise.all([listSocialAccounts(), listSocialPosts()]);

  const accountLabelById = Object.fromEntries(
    accounts.map((a) => [a.id, `${a.platform} · ${a.handle}`])
  );
  const accountPlatformById = Object.fromEntries(accounts.map((a) => [a.id, a.platform]));

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[30px] font-bold text-ink">Content Calendar</div>
          <div className="mt-1.5 text-sm text-ink/55">Posting activity and everything planned</div>
        </div>
        <div className="flex flex-none gap-2">
          <BulkAddPostsModal
            trigger={
              <button className="cursor-pointer whitespace-nowrap rounded-full bg-panel px-5 py-3 text-sm font-semibold text-ink hover:bg-[#EFEFE9]">
                Bulk Add
              </button>
            }
          />
          <NewSocialPostModal
            trigger={
              <button className="cursor-pointer whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a]">
                + New Post
              </button>
            }
          />
        </div>
      </div>

      <div className="mt-5">
        <ContentCalendarView
          posts={posts}
          accountLabelById={accountLabelById}
          accountPlatformById={accountPlatformById}
        />
      </div>
    </>
  );
}
