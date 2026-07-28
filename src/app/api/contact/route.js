import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rate-limit";

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request) {
  const forwarded = request.headers.get("x-forwarded-for") || "unknown";
  const ip = forwarded.split(",")[0].trim();
  const rate = checkRateLimit(`contact:${ip}`, { limit: 4, windowMs: 10 * 60_000 });
  if (!rate.allowed) return NextResponse.json({ message: "Too many attempts. Please wait and try again." }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true });

  const fullName = clean(body.fullName, 120);
  const email = clean(body.email, 180).toLowerCase();
  const message = clean(body.message, 5000);
  const consent = body.consent === true;

  if (fullName.length < 2) return NextResponse.json({ message: "Please enter your full name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 20) return NextResponse.json({ message: "Please add a little more information about your project." }, { status: 400 });
  if (!consent) return NextResponse.json({ message: "Please accept the consent checkbox." }, { status: 400 });

  try {
    const db = await getDb();
    await db.collection("contactMessages").insertOne({
      fullName,
      email,
      phone: clean(body.phone, 80),
      company: clean(body.company, 160),
      service: clean(body.service, 160),
      budget: clean(body.budget, 80),
      message,
      consent,
      read: false,
      ipHash: createHash("sha256").update(`${ip}:${process.env.BETTER_AUTH_SECRET || "portfolio"}`).digest("hex"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "The message could not be saved. Please try again shortly." }, { status: 500 });
  }
}
