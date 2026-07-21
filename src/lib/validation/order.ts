import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  nameSnapshot: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(9).max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  city: z.string().trim().max(160).optional(),
  address: z.string().trim().max(300).optional(),
  deliveryMethod: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(orderItemSchema).min(1),
});

export const quickOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(9).max(20),
  productId: z.string(),
  variantId: z.string().optional(),
  nameSnapshot: z.string().min(1),
  unitPrice: z.number().nonnegative(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type QuickOrderInput = z.infer<typeof quickOrderSchema>;
