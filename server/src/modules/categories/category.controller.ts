import type { Response } from "express";

import { asyncHandler } from "../../middleware/async-handler";
import { categoryService } from "./category.service";
import type { CategoryInput } from "./category.types";

function sendNotImplemented(response: Response, operation: string): void {
  response.status(501).json({
    code: "NOT_IMPLEMENTED",
    message: `${operation} API skeleton is wired. Business logic is not implemented yet.`,
  });
}

export const listCategories = asyncHandler(async (_request, response) => {
  await categoryService.listCategories();
  sendNotImplemented(response, "List categories");
});

export const createCategory = asyncHandler(async (request, response) => {
  await categoryService.createCategory(request.body as CategoryInput);
  sendNotImplemented(response, "Create category");
});

export const updateCategory = asyncHandler(async (request, response) => {
  await categoryService.updateCategory(
    String(request.params.categoryId),
    request.body as CategoryInput,
  );
  sendNotImplemented(response, "Update category");
});

export const deleteCategory = asyncHandler(async (request, response) => {
  await categoryService.deleteCategory(String(request.params.categoryId));
  sendNotImplemented(response, "Delete category");
});
