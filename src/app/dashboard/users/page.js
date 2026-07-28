import { UserManager } from "@/components/dashboard/user-manager";
import { requireAdmin } from "@/lib/auth/session";
export default async function UsersDashboardPage(){ await requireAdmin(); return <UserManager/>; }
