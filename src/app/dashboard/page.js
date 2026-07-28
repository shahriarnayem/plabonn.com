import Link from "next/link";
import { Icon } from "@/components/icon";
import { getDb, serializeDocuments } from "@/lib/mongodb";
import { projects, posts, services, testimonials } from "@/lib/data/demo-data";

export const dynamic = "force-dynamic";

async function getOverview() {
  try {
    const db = await getDb();
    const [projectCount, publishedProjects, postCount, draftPosts, reviewCount, unreadMessages, mediaCount, messages, activity] = await Promise.all([
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
    return { projectCount, publishedProjects, postCount, draftPosts, reviewCount, unreadMessages, mediaCount, messages: serializeDocuments(messages), activity: serializeDocuments(activity) };
  } catch {
    return { projectCount: projects.length, publishedProjects: projects.length, postCount: posts.length, draftPosts: 0, reviewCount: testimonials.length, unreadMessages: 0, mediaCount: 0, messages: [], activity: [] };
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
  return <section className="dashboard-section"><div className="dashboard-page-head"><div><p className="eyebrow">Overview</p><h1>Dashboard</h1><p>A clear view of portfolio content, publishing and client enquiries.</p></div><div className="quick-actions"><Link className="button button-primary" href="/dashboard/works"><Icon name="plus" size={15}/>Add project</Link><Link className="button button-secondary" href="/dashboard/blog"><Icon name="plus" size={15}/>Add article</Link></div></div><div className="dashboard-stat-grid">{stats.map(([label, value, detail, icon]) => <article className="card dashboard-stat" key={label}><div><Icon name={icon} size={22}/><span>{label}</span></div><strong>{value}</strong><p>{detail}</p></article>)}</div><div className="dashboard-overview-grid"><section className="card dashboard-panel"><header><div><h2>Recent enquiries</h2><p>Latest contact form submissions.</p></div><Link href="/dashboard/messages">View inbox</Link></header>{data.messages.length ? <div className="overview-list">{data.messages.map((item) => <Link href="/dashboard/messages" key={item.id}><div><strong>{item.fullName}</strong><span>{item.email}</span></div><p>{item.message}</p><time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US") : ""}</time></Link>)}</div> : <div className="dashboard-empty"><p>No enquiries yet.</p></div>}</section><section className="card dashboard-panel"><header><div><h2>Recent activity</h2><p>Content changes made through the CMS.</p></div></header>{data.activity.length ? <div className="activity-list">{data.activity.map((item) => <div key={item.id}><span className={`activity-icon ${String(item.action).toLowerCase()}`}>{item.action?.slice(0,1)}</span><div><strong>{item.label}</strong><p>{item.action} · {item.resource} · {item.userName || "CMS user"}</p></div><time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US") : ""}</time></div>)}</div> : <div className="dashboard-empty"><p>Activity will appear after the first CMS update.</p></div>}</section></div></section>;
}
