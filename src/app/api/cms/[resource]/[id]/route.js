import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getResourceConfig } from "@/lib/cms/config";
import { sanitizeResourcePayload, validateRequiredFields } from "@/lib/cms/sanitize";
import { getDb, serializeDocument, toObjectId } from "@/lib/mongodb";

function refreshPublic(resource, slug) {
  revalidatePath("/");
  if (resource === "projects") { revalidatePath("/works"); if (slug) revalidatePath(`/works/${slug}`); }
  if (resource === "posts") { revalidatePath("/blog"); if (slug) revalidatePath(`/blog/${slug}`); }
  if (resource === "services") revalidatePath("/services");
  if (resource === "pages") { ["/", "/about", "/services", "/works", "/blog", "/contact", "/privacy", "/terms"].forEach((path) => revalidatePath(path)); if (slug) revalidatePath(slug === "home" ? "/" : `/${slug}`); }
}

export async function GET(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource, id } = await params;
  const config = getResourceConfig(resource);
  const objectId = toObjectId(id);
  if (!config || !objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    const db = await getDb();
    const item = await db.collection(config.collection).findOne({ _id: objectId });
    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ item: serializeDocument(item) });
  } catch {
    return NextResponse.json({ message: "Database connection failed." }, { status: 503 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource, id } = await params;
  const config = getResourceConfig(resource);
  const objectId = toObjectId(id);
  if (!config || !objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }

  try {
    const db = await getDb();
    const collection = db.collection(config.collection);
    const existing = await collection.findOne({ _id: objectId });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });
    const payload = sanitizeResourcePayload(config, input, existing);
    const merged = { ...existing, ...payload };
    const errors = validateRequiredFields(config, merged);
    if (Object.keys(errors).length) return NextResponse.json({ message: "Please complete the required fields.", errors }, { status: 400 });
    if (payload.slug && await collection.findOne({ slug: payload.slug, _id: { $ne: objectId } })) {
      return NextResponse.json({ message: "This slug is already in use.", errors: { slug: "Choose a unique slug." } }, { status: 409 });
    }
    await collection.updateOne({ _id: objectId }, { $set: payload });
    await db.collection("activityLogs").insertOne({
      action: "UPDATE",
      resource,
      documentId: id,
      label: merged[config.titleField] || merged.title || merged.name || "Untitled",
      userId: session.user.id,
      userName: session.user.name,
      createdAt: new Date(),
    });
    refreshPublic(resource, payload.slug || existing.slug);
    return NextResponse.json({ message: `${config.singular} updated.` });
  } catch {
    return NextResponse.json({ message: "The item could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource, id } = await params;
  const config = getResourceConfig(resource);
  const objectId = toObjectId(id);
  if (!config || !objectId) return NextResponse.json({ message: "Not found" }, { status: 404 });
  try {
    const db = await getDb();
    const existing = await db.collection(config.collection).findOne({ _id: objectId });
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });
    await db.collection(config.collection).deleteOne({ _id: objectId });
    await db.collection("activityLogs").insertOne({
      action: "DELETE",
      resource,
      documentId: id,
      label: existing[config.titleField] || existing.title || existing.name || "Untitled",
      userId: session.user.id,
      userName: session.user.name,
      createdAt: new Date(),
    });
    refreshPublic(resource, existing.slug);
    return NextResponse.json({ message: `${config.singular} deleted.` });
  } catch {
    return NextResponse.json({ message: "The item could not be deleted." }, { status: 500 });
  }
}
