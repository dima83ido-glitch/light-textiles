"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { assertCanEdit } from "@/lib/rbac";
import { maybeNotifyLowStock } from "@/lib/notifications";

async function upsertLevel(productId: string, warehouseId: string, delta: number, tx: Prisma.TransactionClient) {
  const existing = await tx.stockLevel.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
  });
  const nextQuantity = Math.max(0, (existing?.quantity ?? 0) + delta);
  await tx.stockLevel.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    update: { quantity: nextQuantity },
    create: { productId, warehouseId, quantity: nextQuantity },
  });
  return nextQuantity;
}

export async function recordIncoming(data: { productId: string; warehouseId: string; quantity: number; note?: string }) {
  const session = await assertCanEdit("warehouses");
  if (data.quantity <= 0) throw new Error("Quantity must be positive");

  await prisma.$transaction(async (tx) => {
    await upsertLevel(data.productId, data.warehouseId, data.quantity, tx);
    await tx.stockMovement.create({
      data: {
        type: "INCOMING",
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        note: data.note || null,
        createdByUserId: session.id,
      },
    });
  });

  revalidatePath(`/admin/warehouses/${data.warehouseId}`);
  revalidatePath("/admin/warehouses");
  revalidatePath("/", "layout");
}

export async function recordOutgoing(data: { productId: string; warehouseId: string; quantity: number; note?: string }) {
  const session = await assertCanEdit("warehouses");
  if (data.quantity <= 0) throw new Error("Quantity must be positive");

  const newQuantity = await prisma.$transaction(async (tx) => {
    const quantity = await upsertLevel(data.productId, data.warehouseId, -data.quantity, tx);
    await tx.stockMovement.create({
      data: {
        type: "OUTGOING",
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        note: data.note || null,
        createdByUserId: session.id,
      },
    });
    return quantity;
  });

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (product) await maybeNotifyLowStock(product, data.warehouseId, newQuantity);

  revalidatePath(`/admin/warehouses/${data.warehouseId}`);
  revalidatePath("/admin/warehouses");
  revalidatePath("/", "layout");
}

export async function transferStock(data: {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  note?: string;
}) {
  const session = await assertCanEdit("warehouses");
  if (data.quantity <= 0) throw new Error("Quantity must be positive");
  if (data.fromWarehouseId === data.toWarehouseId) throw new Error("Source and destination must differ");

  const newFromQuantity = await prisma.$transaction(async (tx) => {
    const fromQuantity = await upsertLevel(data.productId, data.fromWarehouseId, -data.quantity, tx);
    await upsertLevel(data.productId, data.toWarehouseId, data.quantity, tx);
    await tx.stockMovement.create({
      data: {
        type: "TRANSFER",
        productId: data.productId,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        quantity: data.quantity,
        note: data.note || null,
        createdByUserId: session.id,
      },
    });
    return fromQuantity;
  });

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (product) await maybeNotifyLowStock(product, data.fromWarehouseId, newFromQuantity);

  revalidatePath(`/admin/warehouses/${data.fromWarehouseId}`);
  revalidatePath(`/admin/warehouses/${data.toWarehouseId}`);
  revalidatePath("/admin/warehouses");
  revalidatePath("/", "layout");
}

export async function adjustStock(data: { productId: string; warehouseId: string; quantity: number; note?: string }) {
  const session = await assertCanEdit("warehouses");

  const newQuantity = await prisma.$transaction(async (tx) => {
    await tx.stockLevel.upsert({
      where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } },
      update: { quantity: data.quantity },
      create: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.quantity },
    });
    await tx.stockMovement.create({
      data: {
        type: "ADJUSTMENT",
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        note: data.note || null,
        createdByUserId: session.id,
      },
    });
    return data.quantity;
  });

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (product) await maybeNotifyLowStock(product, data.warehouseId, newQuantity);

  revalidatePath(`/admin/warehouses/${data.warehouseId}`);
  revalidatePath("/admin/warehouses");
  revalidatePath("/", "layout");
}
