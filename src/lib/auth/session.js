import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user?.status === "SUSPENDED" || session.user?.banned) redirect("/login?error=suspended");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const isAdmin = session.user?.role === "admin" || session.user?.cmsRole === "ADMIN";
  if (!isAdmin) redirect("/dashboard?error=permission");
  return session;
}

export function sessionCanManageUsers(session) {
  return session?.user?.role === "admin" || session?.user?.cmsRole === "ADMIN";
}
