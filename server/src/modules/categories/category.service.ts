import { AppError } from "../../utils/app-error";
import { categoryRepository } from "./category.repository";
import type { CategoryInput } from "./category.types";

// These are built-in task views, not rows in the categories table.
const RESERVED_VIEW_NAMES = new Set(["my tasks", "mytasks", "important"]);

function ensureCustomName(name: string): void {
  if (RESERVED_VIEW_NAMES.has(name.trim().replace(/\s+/g, " ").toLowerCase())) {
    throw new AppError(
      400,
      "RESERVED_CATEGORY_NAME",
      "This name is reserved for a built-in task view.",
    );
  }
}

function getDatabaseCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  // node-postgres may attach constraint errors directly or as a cause.
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return getDatabaseCode(error.cause);
  return undefined;
}

function duplicateCategoryError(): AppError {
  return new AppError(
    409,
    "CATEGORY_ALREADY_EXISTS",
    "A category with this name already exists.",
  );
}

function categoryInUseError(): AppError {
  return new AppError(
    409,
    "CATEGORY_IN_USE",
    "Category cannot be deleted while tasks are assigned to it.",
  );
}

async function listCategories(userId: number) {
  const data = await categoryRepository.listCategories(userId);
  return { data };
}

async function createCategory(userId: number, input: CategoryInput) {
  ensureCustomName(input.name);
  try {
    return await categoryRepository.createCategory(userId, input.name);
  } catch (error) {
    if (getDatabaseCode(error) === "23505") throw duplicateCategoryError();
    throw error;
  }
}

async function updateCategory(userId: number, categoryId: number, input: CategoryInput) {
  ensureCustomName(input.name);
  try {
    const category = await categoryRepository.updateCategory(userId, categoryId, input.name);
    if (!category) {
      throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found.");
    }
    const taskCount = await categoryRepository.countCategoryTasks(userId, categoryId);
    return { ...category, taskCount };
  } catch (error) {
    if (getDatabaseCode(error) === "23505") throw duplicateCategoryError();
    throw error;
  }
}

async function deleteCategory(userId: number, categoryId: number): Promise<void> {
  const category = await categoryRepository.findCategory(userId, categoryId);
  if (!category) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found.");

  if ((await categoryRepository.countCategoryTasks(userId, categoryId)) > 0) {
    throw categoryInUseError();
  }

  try {
    const deleted = await categoryRepository.deleteCategory(userId, categoryId);
    if (!deleted) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found.");
  } catch (error) {
    // Concurrent task creation is protected by the existing foreign key.
    if (getDatabaseCode(error) === "23503") throw categoryInUseError();
    throw error;
  }
}

export const categoryService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
