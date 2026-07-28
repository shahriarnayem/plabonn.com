import { NextResponse } from "next/server";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getDb, toObjectId } from "@/lib/mongodb";

export async function PATCH(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const read = body.read !== false;
  const db = await getDb();
  await db.collection("contactMessages").updateOne({ _id: objectId }, { $set: { read, updatedAt: new Date() } });
  return NextResponse.json({ message: read ? "Message marked as read." : "Message marked as unread." });
}

export async function DELETE(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const db = await getDb();
  await db.collection("contactMessages").deleteOne({ _id: objectId });
  return NextResponse.json({ message: "Message deleted." });
}
