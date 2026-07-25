import { NextResponse } from "next/server";
import { store } from "@/lib/demo-store";
import { toProductCardData } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const locale = searchParams.get("locale") ?? "uk";
  const ids = idsParam.split(",").filter(Boolean);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = store.products
    .filter((p) => ids.includes(p.id) && p.isVisible)
    .map((p) => ({
      ...p,
      images: [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 1),
      variants: [...p.variants].sort((a, b) => a.price - b.price).slice(0, 1),
    }));

  return NextResponse.json({
    products: products.map((p) => toProductCardData(p, locale)),
  });
}
