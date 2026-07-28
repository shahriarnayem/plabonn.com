import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getApiSession, isEditorSession } from "@/lib/auth/api";
import { getBucket } from "@/lib/mongodb";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxBytes = 6 * 1024 * 1024;

export async function POST(request) {
  const session = await getApiSession(request);
  if (!isEditorSession(session)) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") || "").trim().slice(0, 300);
  if (!(file instanceof File)) return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ message: "Only JPG, PNG, WebP and GIF images are allowed." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ message: "The maximum upload size is 6 MB." }, { status: 400 });

  try {
    const bucket = await getBucket();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 160) || `image-${Date.now()}`;
    const upload = bucket.openUploadStream(safeName, {
      contentType: file.type,
      metadata: {
        alt,
        uploadedBy: session.user.id,
        uploadedByName: session.user.name,
      },
    });
    await new Promise((resolve, reject) => {
      Readable.fromWeb(file.stream()).pipe(upload).on("error", reject).on("finish", resolve);
    });
    return NextResponse.json({
      message: "Image uploaded.",
      item: { id: upload.id.toString(), filename: safeName, url: `/api/media/${upload.id}`, contentType: file.type, length: file.size, metadata: { alt } },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "The image could not be uploaded." }, { status: 500 });
  }
}
