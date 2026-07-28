import { SettingsEditor } from "@/components/dashboard/settings-editor";
import { requireSession, sessionCanManageUsers } from "@/lib/auth/session";
export default async function SeoDashboardPage(){ const session = await requireSession(); return <SettingsEditor mode="seo" canEdit={sessionCanManageUsers(session)}/>; }
