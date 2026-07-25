"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function deleteMediaAsset(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (asset) {
    const filePath = path.join(process.cwd(), "public", asset.url);
    await fs.unlink(filePath).catch(() => {});
  }
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
}
