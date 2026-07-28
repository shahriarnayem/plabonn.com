import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApiSession, isAdminSession } from "@/lib/auth/api";
import { getDb, serializeDocuments } from "@/lib/mongodb";
import { clampNumber, escapeRegex } from "@/lib/utils";

export async function GET(request) {
  const session = await getApiSession(request);
  if (!isAdminSession(session)) return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  const url = new URL(request.url);
  const page = clampNumber(url.searchParams.get("page"), 1, 100000, 1);
  const limit = clampNumber(url.searchParams.get("limit"), 1, 100, 20);
  const search = String(url.searchParams.get("search") || "").trim();
  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }
  const db = await getDb();
  const [items, total] = await Promise.all([
    db.collection("user").find(filter, { projection: { password: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection("user").countDocuments(filter),
  ]);
  return NextResponse.json({ items: serializeDocuments(items), total, page, limit });
}

export async function POST(request) {
  const session = await getApiSession(request);
  if (!isAdminSession(session)) return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const cmsRole = body.cmsRole === "ADMIN" ? "ADMIN" : "EDITOR";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return NextResponse.json({ message: "Enter a valid name, email and password of at least 8 characters." }, { status: 400 });
  }
  try {
    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: cmsRole === "ADMIN" ? "admin" : "user",
        data: { cmsRole, status: "ACTIVE" },
      },
    });
    return NextResponse.json({ message: "User created.", user: result?.user || result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error?.message || "User could not be created." }, { status: 400 });
  }
}
