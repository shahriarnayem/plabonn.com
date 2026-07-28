import { NextResponse } from "next/server";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getDb, serializeDocuments } from "@/lib/mongodb";
import { clampNumber, escapeRegex } from "@/lib/utils";

export async function GET(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const page = clampNumber(url.searchParams.get("page"), 1, 100000, 1);
  const limit = clampNumber(url.searchParams.get("limit"), 1, 100, 24);
  const search = String(url.searchParams.get("search") || "").trim();
  const filter = {};
  if (search) filter.filename = new RegExp(escapeRegex(search), "i");
  try {
    const db = await getDb();
    const collection = db.collection("media.files");
    const [items, total] = await Promise.all([
      collection.find(filter).sort({ uploadDate: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);
    return NextResponse.json({ items: serializeDocuments(items), total, page, limit });
  } catch {
    return NextResponse.json({ message: "Media could not be loaded." }, { status: 500 });
  }
}
