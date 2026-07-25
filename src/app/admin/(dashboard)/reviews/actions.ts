"use server";

import { revalidatePath } from "next/cache";
import { store, genId } from "@/lib/demo-store";

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  const review = store.reviews.find((r) => r.id === id);
  if (!review) return;
  review.isApproved = isApproved;
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function deleteReview(id: string) {
  store.reviews = store.reviews.filter((r) => r.id !== id);
  revalidatePath("/admin/reviews");
}

export async function createReview(data: { authorName: string; rating: number; text: string }) {
  store.reviews.unshift({
    id: genId(),
    productId: null,
    authorName: data.authorName,
    rating: data.rating,
    text: data.text,
    photos: [],
    isApproved: true,
    createdAt: new Date(),
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}
