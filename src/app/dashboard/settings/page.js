import { SettingsEditor } from "@/components/dashboard/settings-editor";
import { requireSession, sessionCanManageUsers } from "@/lib/auth/session";
export default async function SettingsDashboardPage(){ const session = await requireSession(); return <SettingsEditor canEdit={sessionCanManageUsers(session)}/>; }
