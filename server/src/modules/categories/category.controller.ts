import { asyncHandler } from "../../middleware/async-handler";
import { categoryService } from "./category.service";
import type { CategoryInput } from "./category.types";

export const listCategories = asyncHandler(async (request, response) => {
  const result = await categoryService.listCategories(request.auth!.userId);
  response.status(200).json(result);
});

export const createCategory = asyncHandler(async (request, response) => {
  const result = await categoryService.createCategory(
    request.auth!.userId,
    request.body as CategoryInput,
  );
  response.status(201).json(result);
});

export const updateCategory = asyncHandler(async (request, response) => {
  const result = await categoryService.updateCategory(
    request.auth!.userId,
    Number(request.params.categoryId),
    request.body as CategoryInput,
  );
  response.status(200).json(result);
});

export const deleteCategory = asyncHandler(async (request, response) => {
  await categoryService.deleteCategory(
    request.auth!.userId,
    Number(request.params.categoryId),
  );
  response.status(204).end();
});
