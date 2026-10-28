import { AppError } from "../../utils/app-error";
import { categoryRepository } from "../categories/category.repository";
import { taskRepository } from "./task.repository";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.types";

function getDatabaseCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return getDatabaseCode(error.cause);
  return undefined;
}

async function ensureOwnedCategory(userId: number, categoryId: number | null | undefined) {
  if (categoryId === undefined || categoryId === null) return;
  if (!(await categoryRepository.findCategory(userId, categoryId))) {
    throw new AppError(400, "INVALID_CATEGORY", "The selected category is invalid.");
  }
}

async function listTasks(userId: number, query: ListTasksQuery) {
  return taskRepository.listTasks(userId, query);
}

async function createTask(userId: number, input: CreateTaskInput) {
  await ensureOwnedCategory(userId, input.categoryId);
  try {
    return await taskRepository.createTask(userId, input);
  } catch (error) {
    // Covers a category deleted between the ownership check and INSERT.
    if (getDatabaseCode(error) === "23503") {
      throw new AppError(400, "INVALID_CATEGORY", "The selected category is invalid.");
    }
    throw error;
  }
}

async function getTask(userId: number, taskId: number) {
  const task = await taskRepository.findTask(userId, taskId);
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  return task;
}

async function updateTask(userId: number, taskId: number, input: UpdateTaskInput) {
  // Avoid exposing whether an ID exists in another user's account.
  await getTask(userId, taskId);
  await ensureOwnedCategory(userId, input.categoryId);

  try {
    const task = await taskRepository.updateTask(userId, taskId, input);
    if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
    return task;
  } catch (error) {
    if (getDatabaseCode(error) === "23503") {
      throw new AppError(400, "INVALID_CATEGORY", "The selected category is invalid.");
    }
    throw error;
  }
}

async function deleteTask(userId: number, taskId: number): Promise<void> {
  if (!(await taskRepository.deleteTask(userId, taskId))) {
    throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  }
}

export const taskService = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
