import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getBucket, getDb, toObjectId } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return new NextResponse("Not found", { status: 404 });
  try {
    const db = await getDb();
    const file = await db.collection("media.files").findOne({ _id: objectId });
    if (!file) return new NextResponse("Not found", { status: 404 });
    const bucket = await getBucket();
    const stream = bucket.openDownloadStream(objectId);
    return new NextResponse(Readable.toWeb(stream), {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Length": String(file.length || ""),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${String(file.filename).replaceAll('"', '')}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const db = await getDb();
  const set = { "metadata.alt": String(body.alt || "").trim().slice(0, 300) };
  if (body.filename) set.filename = String(body.filename).replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 160);
  await db.collection("media.files").updateOne({ _id: objectId }, { $set: set });
  return NextResponse.json({ message: "Media details updated." });
}

export async function DELETE(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    const bucket = await getBucket();
    await bucket.delete(objectId);
    return NextResponse.json({ message: "Media deleted." });
  } catch {
    return NextResponse.json({ message: "Media could not be deleted." }, { status: 500 });
  }
}
