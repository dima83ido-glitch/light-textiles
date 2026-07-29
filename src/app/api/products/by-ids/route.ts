import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCardSelect, toProductCardData } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const locale = searchParams.get("locale") ?? "uk";
  const ids = idsParam.split(",").filter(Boolean).slice(0, 100);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isVisible: true },
    select: productCardSelect,
  });

  return NextResponse.json({
    products: products.map((p) => toProductCardData(p, locale)),
  });
}
