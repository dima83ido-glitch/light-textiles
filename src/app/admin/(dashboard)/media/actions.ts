"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";

export async function deleteMediaAsset(id: string) {
  await assertCanEdit("media");
  const asset = await prisma.mediaAsset.delete({ where: { id } }).catch(() => null);
  if (asset?.url.startsWith("/uploads/")) {
    await fs.unlink(path.join(process.cwd(), "public", asset.url)).catch(() => {});
  }
  revalidatePath("/admin/media");
}
