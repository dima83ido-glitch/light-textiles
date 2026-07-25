import { store, genId } from "@/lib/demo-store";

/**
 * Portfolio-demo upload: no disk, no DB. The file is converted to a data URL
 * and registered in the in-memory media store, so it's usable immediately
 * (product/category/banner form previews, media library) for the lifetime of
 * this server process. It does not persist across a restart/redeploy.
 */
export async function saveUploadedFile(file: File): Promise<{ url: string; id: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const url = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const id = genId();
  store.mediaAssets.unshift({
    id,
    url,
    filename: file.name,
    size: file.size,
    mimeType,
    width: null,
    height: null,
    createdAt: new Date(),
  });

  return { url, id };
}
