import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getResourceConfig } from "@/lib/cms/config";
import { sanitizeResourcePayload, validateRequiredFields } from "@/lib/cms/sanitize";
import { getDb, serializeDocuments } from "@/lib/mongodb";
import { clampNumber, escapeRegex } from "@/lib/utils";
import { ensureDefaultContent } from "@/lib/data/bootstrap";

function refreshPublic(resource, slug) {
  revalidatePath("/");
  if (resource === "projects") revalidatePath("/works");
  if (resource === "posts") revalidatePath("/blog");
  if (resource === "services") revalidatePath("/services");
  if (resource === "pages") {
    ["/", "/about", "/services", "/works", "/blog", "/contact", "/privacy", "/terms"].forEach((path) => revalidatePath(path));
    if (slug) revalidatePath(slug === "home" ? "/" : `/${slug}`);
  }
}

export async function GET(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await params;
  const config = getResourceConfig(resource);
  if (!config) return NextResponse.json({ message: "Unknown resource" }, { status: 404 });

  const url = new URL(request.url);
  const page = clampNumber(url.searchParams.get("page"), 1, 100000, 1);
  const limit = clampNumber(url.searchParams.get("limit"), 1, 100, 20);
  const search = String(url.searchParams.get("search") || "").trim();
  const status = String(url.searchParams.get("status") || "").trim();
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    const fields = [config.titleField, "title", "name", "clientName", "excerpt", "reviewText"].filter(Boolean);
    filter.$or = [...new Set(fields)].map((field) => ({ [field]: regex }));
  }

  try {
    await ensureDefaultContent();
    const db = await getDb();
    const collection = db.collection(config.collection);
    const [documents, total] = await Promise.all([
      collection.find(filter).sort({ order: 1, updatedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);
    return NextResponse.json({ items: serializeDocuments(documents), total, page, limit });
  } catch {
    return NextResponse.json({ message: "Database connection failed." }, { status: 503 });
  }
}

export async function POST(request, { params }) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await params;
  const config = getResourceConfig(resource);
  if (!config) return NextResponse.json({ message: "Unknown resource" }, { status: 404 });

  let input;
  try { input = await request.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }
  const payload = sanitizeResourcePayload(config, input);
  const errors = validateRequiredFields(config, payload);
  if (Object.keys(errors).length) return NextResponse.json({ message: "Please complete the required fields.", errors }, { status: 400 });

  try {
    const db = await getDb();
    const collection = db.collection(config.collection);
    if (payload.slug && await collection.findOne({ slug: payload.slug })) {
      return NextResponse.json({ message: "This slug is already in use.", errors: { slug: "Choose a unique slug." } }, { status: 409 });
    }
    const result = await collection.insertOne(payload);
    await db.collection("activityLogs").insertOne({
      action: "CREATE",
      resource,
      documentId: result.insertedId.toString(),
      label: payload[config.titleField] || payload.title || payload.name || "Untitled",
      userId: session.user.id,
      userName: session.user.name,
      createdAt: new Date(),
    });
    refreshPublic(resource, payload.slug);
    return NextResponse.json({ id: result.insertedId.toString(), message: `${config.singular} created.` }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "The item could not be created." }, { status: 500 });
  }
}
