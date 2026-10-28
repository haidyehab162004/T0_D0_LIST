import { z } from "zod";

const categoryIdParamsSchema = z.object({
  categoryId: z
    .string()
    .regex(/^[1-9]\d*$/, "Category ID must be a positive integer.")
    .refine(
      (value) => Number.isSafeInteger(Number(value)) && Number(value) <= 2_147_483_647,
      "Category ID is out of range.",
    ),
});

const categoryBodySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
});

export const createCategoryValidation = {
  body: categoryBodySchema,
};

export const categoryIdValidation = {
  params: categoryIdParamsSchema,
};

export const updateCategoryValidation = {
  params: categoryIdParamsSchema,
  body: categoryBodySchema,
};
