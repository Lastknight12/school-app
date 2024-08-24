import { z } from "zod";

export const sendAmountSchema = z.object({
  amount: z
    .number()
    .min(1, { message: "Мінімальна сума 1" })
    .max(99999999, { message: "Максимальна сума 99 999 999" }),
});

export const addKlassSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Вкажіть назву класу" })
    .max(3, { message: "Максимальна довжина назви 3" }),
  teacherId: z.string().min(1, { message: "Виберіть викладача" }),
});
