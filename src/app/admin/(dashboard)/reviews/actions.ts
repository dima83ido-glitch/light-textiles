"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  await prisma.review.update({ where: { id }, data: { isApproved } });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
}

export async function createReview(data: { authorName: string; rating: number; text: string }) {
  await prisma.review.create({
    data: { authorName: data.authorName, rating: data.rating, text: data.text, isApproved: true },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}
