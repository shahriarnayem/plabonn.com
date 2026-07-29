import { NextResponse } from "next/server";
import { hasMongoConfiguration, pingDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeMessage(error) {
  return String(error?.message || "Unknown MongoDB error")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI hidden]")
    .replace(/([^:\s]+):([^@\s]+)@/g, "$1:[password hidden]@");
}

export async function GET() {
  if (!hasMongoConfiguration()) {
    return NextResponse.json(
      {
        service: "mongodb",
        configured: false,
        connected: false,
        message: "MONGODB_URI is missing from the deployment environment.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await pingDatabase();
    return NextResponse.json({
      service: "mongodb",
      configured: true,
      connected: true,
      database: result.database,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: "mongodb",
        configured: true,
        connected: false,
        message: safeMessage(error),
      },
      { status: 503 },
    );
  }
}
