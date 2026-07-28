import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiSession, isAdminSession } from "@/lib/auth/api";
import { getDb } from "@/lib/mongodb";

export async function PATCH(request, { params }) {
  const session = await getApiSession(request);
  if (!isAdminSession(session)) return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const cmsRole = body.cmsRole === "ADMIN" ? "ADMIN" : "EDITOR";
  try {
    if (body.name || body.email) {
      await auth.api.adminUpdateUser({ body: { userId: id, data: { ...(body.name ? { name: String(body.name).trim() } : {}), ...(body.email ? { email: String(body.email).trim().toLowerCase() } : {}) } }, headers: request.headers });
    }
    await auth.api.setRole({ body: { userId: id, role: cmsRole === "ADMIN" ? "admin" : "user" }, headers: request.headers });
    if (body.password) await auth.api.setUserPassword({ body: { userId: id, newPassword: String(body.password) }, headers: request.headers });
    const db = await getDb();
    await db.collection("user").updateOne({ _id: id }, { $set: { cmsRole, status: body.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE", banned: body.status === "SUSPENDED", updatedAt: new Date() } });
    return NextResponse.json({ message: "User updated." });
  } catch (error) {
    return NextResponse.json({ message: error?.message || "User could not be updated." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getApiSession(request);
  if (!isAdminSession(session)) return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  const { id } = await params;
  if (id === session.user.id) return NextResponse.json({ message: "You cannot delete your own active account." }, { status: 400 });
  try {
    const db = await getDb();
    await Promise.all([
      db.collection("user").deleteOne({ _id: id }),
      db.collection("account").deleteMany({ userId: id }),
      db.collection("session").deleteMany({ userId: id }),
    ]);
    return NextResponse.json({ message: "User deleted." });
  } catch {
    return NextResponse.json({ message: "User could not be deleted." }, { status: 500 });
  }
}
