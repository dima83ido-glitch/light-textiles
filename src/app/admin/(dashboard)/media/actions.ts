"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/demo-store";

export async function deleteMediaAsset(id: string) {
  store.mediaAssets = store.mediaAssets.filter((a) => a.id !== id);
  revalidatePath("/admin/media");
}
