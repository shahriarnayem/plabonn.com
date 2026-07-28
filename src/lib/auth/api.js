import { auth } from "@/lib/auth";

export async function getApiSession(request) {
  try {
    return await auth.api.getSession({ headers: request.headers });
  } catch {
    return null;
  }
}

export function isAdminSession(session) {
  return session?.user?.role === "admin" || session?.user?.cmsRole === "ADMIN";
}

export function isEditorSession(session) {
  return Boolean(session) && session.user?.status !== "SUSPENDED" && !session.user?.banned;
}
