import { z } from "zod";

// Разрешаем только http/https
const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: "URL must start with http:// or https://" });

const Open = z.object({
  type: z.literal("open"),
  url: httpUrl,
});

const Click = z.object({
  type: z.literal("click"),
  selector: z.string().min(1),
});

const ExpectVisible = z.object({
  type: z.literal("expectVisible"),
  selector: z.string().min(1),
  timeout: z.number().int().positive().optional(),
});

const Screenshot = z.object({
  type: z.literal("screenshot"),
  name: z.string().min(1).optional(),
});

const VisualDiff = z.object({
  type: z.literal("visualDiff"),
  name: z.string().min(1).optional(),
  maxDiffPct: z.number().min(0).max(100).optional(),
});

const OcrAssert = z.object({
  type: z.literal("ocrAssert"),
  contains: z.string().min(1),
});

export const DslV1 = z.object({
  actions: z.array(z.union([Open, Click, ExpectVisible, Screenshot, VisualDiff, OcrAssert])).min(1),
});
