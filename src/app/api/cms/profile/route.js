import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getDb } from "@/lib/mongodb";

export async function GET(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ item: session.user });
}

export async function PUT(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const bio = String(body.bio || "").trim().slice(0, 1000);
  if (name.length < 2) return NextResponse.json({ message: "Please enter your name." }, { status: 400 });
  try {
    const db = await getDb();
    await db.collection("user").updateOne({ _id: session.user.id }, { $set: { name, bio, updatedAt: new Date() } });
    if (body.currentPassword && body.newPassword) {
      await auth.api.changePassword({
        body: { currentPassword: String(body.currentPassword), newPassword: String(body.newPassword), revokeOtherSessions: true },
        headers: request.headers,
      });
    }
    return NextResponse.json({ message: "Profile updated." });
  } catch (error) {
    return NextResponse.json({ message: error?.message || "Profile could not be updated." }, { status: 400 });
  }
}
