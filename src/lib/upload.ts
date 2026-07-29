import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Extension/MIME-type are attacker-controlled (set by the browser from the file being
// uploaded) so they're only used as a cheap first filter. The actual gate is the sharp
// decode below, which fails unless the bytes are a real, well-formed image.
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const ALLOWED_SHARP_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export class UploadValidationError extends Error {}

export async function saveUploadedFile(file: File): Promise<{ url: string; id: string }> {
  if (file.size <= 0) {
    throw new UploadValidationError("File is empty");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadValidationError("File exceeds the maximum size of 10 MB");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new UploadValidationError("Unsupported file extension");
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadValidationError("Unsupported file type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new UploadValidationError("File exceeds the maximum size of 10 MB");
  }

  let format: string | undefined;
  try {
    format = (await sharp(buffer).metadata()).format;
  } catch {
    throw new UploadValidationError("File is not a valid image");
  }
  if (!format || !ALLOWED_SHARP_FORMATS.has(format)) {
    throw new UploadValidationError("File is not a valid image");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), buffer);

  const url = `/uploads/media/${safeName}`;

  const asset = await prisma.mediaAsset.create({
    data: {
      url,
      filename: file.name,
      size: buffer.length,
      mimeType: file.type,
    },
  });

  return { url, id: asset.id };
}
