import { z } from "zod";

// PostgreSQL identity columns are 32-bit integers; validate IDs before Number().
// Prevent oversized identifiers and page values from producing unsafe offsets.
const positiveIntegerString = (fieldName: string) =>
  z.string()
    .regex(/^[1-9]\d*$/, `${fieldName} must be a positive integer.`)
    .refine(
      (value) => Number.isSafeInteger(Number(value)) && Number(value) <= 2_147_483_647,
      `${fieldName} is out of range.`,
    );

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Invalid date.");

const taskIdParamsSchema = z.object({
  taskId: positiveIntegerString("Task ID"),
});

const taskFieldsSchema = {
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().nullable(),
  dueDate: dateOnlySchema.nullable(),
  categoryId: z.number().int().positive("Category ID must be a positive integer.").nullable(),
  isImportant: z.boolean(),
};

export const listTasksValidation = {
  query: z.object({
    completed: z.enum(["true", "false"]).optional(),
    important: z.enum(["true", "false"]).optional(),
    categoryId: positiveIntegerString("Category ID").optional(),
    q: z.string().optional(),
    sort: z.enum(["createdAt", "dueDate", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: positiveIntegerString("Page").optional(),
    limit: positiveIntegerString("Limit").optional(),
  }),
};

export const createTaskValidation = {
  body: z.object({
    title: taskFieldsSchema.title,
    description: taskFieldsSchema.description.optional(),
    dueDate: taskFieldsSchema.dueDate.optional(),
    categoryId: taskFieldsSchema.categoryId.optional(),
    isImportant: taskFieldsSchema.isImportant.optional(),
  }),
};

export const taskIdValidation = {
  params: taskIdParamsSchema,
};

export const updateTaskValidation = {
  params: taskIdParamsSchema,
  body: z
    .object({
      title: taskFieldsSchema.title.optional(),
      description: taskFieldsSchema.description.optional(),
      dueDate: taskFieldsSchema.dueDate.optional(),
      categoryId: taskFieldsSchema.categoryId.optional(),
      isCompleted: z.boolean().optional(),
      isImportant: taskFieldsSchema.isImportant.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one task field must be provided.",
      path: ["body"],
    }),
};
