import { categoryRepository } from "./category.repository";
import type { CategoryInput } from "./category.types";

async function listCategories(): Promise<void> {
  await categoryRepository.placeholder("listCategories");
}

async function createCategory(input: CategoryInput): Promise<void> {
  await categoryRepository.placeholder("createCategory", input);
}

async function updateCategory(categoryId: string, input: CategoryInput): Promise<void> {
  await categoryRepository.placeholder("updateCategory", { categoryId, input });
}

async function deleteCategory(categoryId: string): Promise<void> {
  await categoryRepository.placeholder("deleteCategory", { categoryId });
}

export const categoryService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
