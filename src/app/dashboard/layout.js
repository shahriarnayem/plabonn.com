import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/content";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const [session, settings] = await Promise.all([requireSession(), getSettings()]);
  return <DashboardShell session={session} settings={settings}>{children}</DashboardShell>;
}
