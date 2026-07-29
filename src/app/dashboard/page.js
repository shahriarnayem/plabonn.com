import Link from "next/link";
import { Icon } from "@/components/icon";
import { getDb, serializeDocuments } from "@/lib/mongodb";
import { projects, posts, services, testimonials } from "@/lib/data/demo-data";

export const dynamic = "force-dynamic";

async function getOverview() {
  try {
    const db = await getDb();
    const [
      projectCount,
      publishedProjects,
      postCount,
      draftPosts,
      reviewCount,
      unreadMessages,
      mediaCount,
      messages,
      activity,
    ] = await Promise.all([
      db.collection("projects").countDocuments(),
      db.collection("projects").countDocuments({ status: "PUBLISHED" }),
      db.collection("posts").countDocuments(),
      db.collection("posts").countDocuments({ status: "DRAFT" }),
      db.collection("testimonials").countDocuments(),
      db.collection("contactMessages").countDocuments({ read: false }),
      db.collection("media.files").countDocuments(),
      db.collection("contactMessages").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection("activityLogs").find({}).sort({ createdAt: -1 }).limit(8).toArray(),
    ]);

    return {
      projectCount,
      publishedProjects,
      postCount,
      draftPosts,
      reviewCount,
      unreadMessages,
      mediaCount,
      messages: serializeDocuments(messages),
      activity: serializeDocuments(activity),
    };
  } catch {
    return {
      projectCount: projects.length,
      publishedProjects: projects.length,
      postCount: posts.length,
      draftPosts: 0,
      reviewCount: testimonials.length,
      unreadMessages: 0,
      mediaCount: 0,
      messages: [],
      activity: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getOverview();
  const stats = [
    ["Projects", data.projectCount, `${data.publishedProjects} published`, "layout"],
    ["Articles", data.postCount, `${data.draftPosts} drafts`, "edit"],
    ["Reviews", data.reviewCount, "client testimonials", "message"],
    ["Unread", data.unreadMessages, "contact messages", "mail"],
    ["Media", data.mediaCount, "GridFS files", "image"],
    ["Services", services.length, "service cards", "settings"],
  ];

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--text-faint)]">
            Overview
          </p>
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold uppercase leading-[1.16] tracking-[-0.03em]">
            Dashboard
          </h1>
          <p className="mt-2 max-w-[680px] text-sm text-[var(--text-soft)]">
            A clear view of portfolio content, publishing and client enquiries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-[var(--accent)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/dashboard/works"
          >
            <Icon name="plus" size={15} />
            Add project
          </Link>
          <Link
            className="inline-flex min-h-[38px] items-center justify-center gap-2.5 rounded-[7px] bg-[var(--card)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.015em] transition-colors duration-150 hover:bg-[var(--card-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/dashboard/blog"
          >
            <Icon name="plus" size={15} />
            Add article
          </Link>
        </div>
      </div>

      <div className="grid grid-flow-dense grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, detail, icon]) => (
          <article
            className="relative min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)] p-5"
            key={label}
          >
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <Icon name={icon} size={22} />
              <span className="text-xs font-semibold uppercase">{label}</span>
            </div>
            <strong className="mt-5 block text-3xl leading-none">{value}</strong>
            <p className="mt-2 text-xs text-[var(--text-faint)]">{detail}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-flow-dense grid-cols-1 gap-[14px] xl:grid-cols-2">
        <section className="relative min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)]">
          <header className="flex items-start justify-between gap-4 p-5">
            <div>
              <h2 className="text-lg font-bold">Recent enquiries</h2>
              <p className="mt-1 text-xs text-[var(--text-soft)]">
                Latest contact form submissions.
              </p>
            </div>
            <Link
              className="rounded-md text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href="/dashboard/messages"
            >
              View inbox
            </Link>
          </header>
          {data.messages.length ? (
            <div className="grid gap-1 p-2 pt-0">
              {data.messages.map((item) => (
                <Link
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-[8px] bg-[var(--card-soft)] p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  href="/dashboard/messages"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">{item.fullName}</strong>
                    <span className="block truncate text-xs text-[var(--text-faint)]">
                      {item.email}
                    </span>
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--text-soft)]">
                      {item.message}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--text-faint)]">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US")
                      : ""}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-[var(--text-soft)]">No enquiries yet.</div>
          )}
        </section>

        <section className="relative min-w-0 overflow-hidden rounded-[12px] bg-[var(--card)]">
          <header className="p-5">
            <h2 className="text-lg font-bold">Recent activity</h2>
            <p className="mt-1 text-xs text-[var(--text-soft)]">
              Content changes made through the CMS.
            </p>
          </header>
          {data.activity.length ? (
            <div className="grid gap-1 p-2 pt-0">
              {data.activity.map((item) => (
                <div
                  className="grid grid-cols-[32px_1fr_auto] items-start gap-3 rounded-[8px] bg-[var(--card-soft)] p-3"
                  key={item.id}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white ${
                      String(item.action).toLowerCase() === "delete"
                        ? "bg-[var(--danger)]"
                        : "bg-[var(--accent)]"
                    }`}
                  >
                    {item.action?.slice(0, 1)}
                  </span>
                  <div>
                    <strong className="block text-sm">{item.label}</strong>
                    <p className="mt-1 text-xs text-[var(--text-soft)]">
                      {item.action} · {item.resource} · {item.userName || "CMS user"}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--text-faint)]">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US")
                      : ""}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-[var(--text-soft)]">
              Activity will appear after the first CMS update.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
