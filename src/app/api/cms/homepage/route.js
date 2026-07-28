import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getDb, serializeDocument } from "@/lib/mongodb";
import { defaultHomepage } from "@/lib/data/demo-data";
import { normalizeArray, safeJson, safeUrl } from "@/lib/utils";

function normalize(input = {}) {
  const hero = safeJson(input.hero, input.hero || {});
  const about = safeJson(input.about, input.about || {});
  return {
    hero: {
      eyebrow: String(hero.eyebrow || "").trim(),
      heading: String(hero.heading || "").trim(),
      paragraph: String(hero.paragraph || "").trim(),
      ctaText: String(hero.ctaText || "").trim(),
      ctaUrl: safeUrl(hero.ctaUrl),
      availability: String(hero.availability || "").trim(),
      image: safeUrl(hero.image, { image: true }),
      imageAlt: String(hero.imageAlt || "").trim(),
    },
    about: {
      label: String(about.label || "").trim(),
      bio: String(about.bio || "").trim(),
      secondary: String(about.secondary || "").trim(),
      experience: String(about.experience || "").trim(),
      skills: normalizeArray(about.skills),
    },
    worksHeading: String(input.worksHeading || "").trim(),
    worksDescription: String(input.worksDescription || "").trim(),
    reviewsHeading: String(input.reviewsHeading || "").trim(),
    reviewsDescription: String(input.reviewsDescription || "").trim(),
    ctaHeading: String(input.ctaHeading || "").trim(),
    ctaSupporting: String(input.ctaSupporting || "").trim(),
    ctaText: String(input.ctaText || "").trim(),
    ctaUrl: safeUrl(input.ctaUrl),
    blogHeading: String(input.blogHeading || "").trim(),
    blogDescription: String(input.blogDescription || "").trim(),
    updatedAt: new Date(),
  };
}

export async function GET(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const item = await db.collection("homepage").findOne({ key: "homepage" });
    return NextResponse.json({ item: serializeDocument(item) || defaultHomepage });
  } catch {
    return NextResponse.json({ item: defaultHomepage });
  }
}

export async function PUT(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }
  const payload = normalize(body);
  try {
    const db = await getDb();
    await db.collection("homepage").updateOne({ key: "homepage" }, { $set: payload, $setOnInsert: { key: "homepage", createdAt: new Date() } }, { upsert: true });
    await db.collection("activityLogs").insertOne({ action: "UPDATE", resource: "homepage", label: "Homepage content", userId: session.user.id, userName: session.user.name, createdAt: new Date() });
    revalidatePath("/");
    return NextResponse.json({ message: "Homepage content saved." });
  } catch {
    return NextResponse.json({ message: "Homepage content could not be saved." }, { status: 500 });
  }
}
