import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");

export async function saveUploadedFile(file: File): Promise<{ url: string; id: string }> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || "";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), buffer);

  const url = `/uploads/media/${safeName}`;

  const asset = await prisma.mediaAsset.create({
    data: {
      url,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    },
  });

  return { url, id: asset.id };
}
