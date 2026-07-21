import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toProductCardData } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const locale = searchParams.get("locale") ?? "uk";
  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isVisible: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
  });

  return NextResponse.json({
    products: products.map((p) => toProductCardData(p, locale)),
  });
}
