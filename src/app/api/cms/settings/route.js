import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession, isAdminSession, isEditorSession } from "@/lib/auth/api";
import { getDb, serializeDocument } from "@/lib/mongodb";
import { defaultSettings } from "@/lib/data/demo-data";
import { normalizeArray, safeHexColor, safeJson, safeUrl } from "@/lib/utils";

function normalize(input = {}) {
  return {
    siteName: String(input.siteName || "").trim(),
    textLogo: String(input.textLogo || "").trim(),
    logoImage: safeUrl(input.logoImage, { image: true }),
    lightLogo: safeUrl(input.lightLogo, { image: true }),
    darkLogo: safeUrl(input.darkLogo, { image: true }),
    favicon: safeUrl(input.favicon, { image: true }) || "/favicon.svg",
    defaultTheme: ["light", "dark", "system"].includes(input.defaultTheme) ? input.defaultTheme : "system",
    accentColor: safeHexColor(input.accentColor, "#9a000f"),
    contactEmail: String(input.contactEmail || "").trim(),
    phone: String(input.phone || "").trim(),
    location: String(input.location || "").trim(),
    socialLinks: Object.fromEntries(Object.entries(safeJson(input.socialLinks, typeof input.socialLinks === "object" ? input.socialLinks : {})).map(([key, value]) => [String(key).slice(0, 50), safeUrl(value)]).filter(([, value]) => value)),
    footerCopyright: String(input.footerCopyright || "").trim(),
    headerSticky: Boolean(input.headerSticky),
    sectionVisibility: safeJson(input.sectionVisibility, typeof input.sectionVisibility === "object" ? input.sectionVisibility : {}),
    sectionOrder: normalizeArray(input.sectionOrder),
    homeProjectCount: Math.max(1, Math.min(20, Number(input.homeProjectCount) || 5)),
    homeTestimonialCount: Math.max(1, Math.min(20, Number(input.homeTestimonialCount) || 5)),
    homePostCount: Math.max(1, Math.min(20, Number(input.homePostCount) || 10)),
    maintenanceMode: Boolean(input.maintenanceMode),
    defaultSeoTitle: String(input.defaultSeoTitle || "").trim(),
    defaultSeoDescription: String(input.defaultSeoDescription || "").trim(),
    defaultSocialImage: safeUrl(input.defaultSocialImage, { image: true }),
    updatedAt: new Date(),
  };
}

export async function GET(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const item = await db.collection("siteSettings").findOne({ key: "site" });
    return NextResponse.json({ item: serializeDocument(item) || defaultSettings });
  } catch {
    return NextResponse.json({ item: defaultSettings });
  }
}

export async function PUT(request) {
  const session = await getApiSession(request);
  if (!isAdminSession(session)) return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }
  const payload = normalize(body);
  try {
    const db = await getDb();
    await db.collection("siteSettings").updateOne({ key: "site" }, { $set: payload, $setOnInsert: { key: "site", createdAt: new Date() } }, { upsert: true });
    await db.collection("activityLogs").insertOne({ action: "UPDATE", resource: "settings", label: "Site settings", userId: session.user.id, userName: session.user.name, createdAt: new Date() });
    revalidatePath("/", "layout");
    return NextResponse.json({ message: "Settings saved." });
  } catch {
    return NextResponse.json({ message: "Settings could not be saved." }, { status: 500 });
  }
}
