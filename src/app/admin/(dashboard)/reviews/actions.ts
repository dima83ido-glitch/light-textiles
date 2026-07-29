"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertCanEdit } from "@/lib/rbac";

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  await assertCanEdit("reviews");
  await prisma.review.update({ where: { id }, data: { isApproved } });
  revalidateTag("reviews");
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function deleteReview(id: string) {
  await assertCanEdit("reviews");
  await prisma.review.delete({ where: { id } });
  revalidateTag("reviews");
  revalidatePath("/admin/reviews");
}

export async function createReview(data: { authorName: string; rating: number; text: string }) {
  await assertCanEdit("reviews");
  await prisma.review.create({
    data: {
      productId: null,
      authorName: data.authorName,
      rating: data.rating,
      text: data.text,
      photos: [],
      isApproved: true,
    },
  });
  revalidateTag("reviews");
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}
