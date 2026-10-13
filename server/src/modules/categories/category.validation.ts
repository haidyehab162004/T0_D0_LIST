import { z } from "zod";

const categoryIdParamsSchema = z.object({
  categoryId: z
    .string()
    .regex(/^[1-9]\d*$/, "Category ID must be a positive integer."),
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
