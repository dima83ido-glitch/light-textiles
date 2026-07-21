import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2, "Мінімум 2 символи").max(120),
  phone: z
    .string()
    .trim()
    .min(9, "Введіть коректний номер телефону")
    .max(20),
  email: z.union([z.literal(""), z.string().trim().email()]).optional(),
  message: z.string().trim().min(5, "Опишіть ваше питання").max(2000),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
