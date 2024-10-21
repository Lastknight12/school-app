import { MusicOrderStatus } from "@prisma/client";
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
    .max(4, { message: "Максимальна довжина назви 4" })
    // match only classes like 1-11-АБВ
    // example: 11-Б, 7 but not 12, 0, 11-ББ
    .refine((val) => /^(?:[1-9]|1[01])(-?[А-Яа-я]{1})?$/.test(val), 
        "Невірний формат назви. Доступний формат 1-11-АБВ. Наприклад 10-Б або 10",
    ),
  teacherIds: z
    .array(z.string())
    .min(1, { message: "Виберіть хоча б 1 викладача" }),
});

export const addProductSchema = z.object({
  title: z.string().min(1, { message: "Вкажіть назву продукту" }),
  count: z.number().max(99999999, { message: "Максимальна кількість 999" }),
  price: z
    .number()
    .min(1, { message: "Мінімальна ціна 1" })
    .max(99999999, { message: "Максимальна ціна 999" }),
  imageSrc: z
    .string()
    .min(1, { message: "Завантажте зображення" })
    .url({ message: "Вкажіть коректний URL зображення" }),
  category: z.string().min(1, { message: "Виберіть категорію" }),
});

export const musicOrderStatusSchema = z.enum(["ACCEPTED", "DELIVERED", "CANCELLED"]).transform((value: string) => {
  switch (value) {
    case "ACCEPTED":
      return MusicOrderStatus.ACCEPTED;
    case "DELIVERED":
      return MusicOrderStatus.DELIVERED;
    case "CANCELLED":
      return MusicOrderStatus.CANCELLED;
    default:
      throw new Error(`Невірний статус: ${value}`);
  }
});
