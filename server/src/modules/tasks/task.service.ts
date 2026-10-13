import { taskRepository } from "./task.repository";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.types";

async function listTasks(query: ListTasksQuery): Promise<void> {
  await taskRepository.placeholder("listTasks", query);
}

async function createTask(input: CreateTaskInput): Promise<void> {
  await taskRepository.placeholder("createTask", input);
}

async function getTask(taskId: string): Promise<void> {
  await taskRepository.placeholder("getTask", { taskId });
}

async function updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
  await taskRepository.placeholder("updateTask", { taskId, input });
}

async function deleteTask(taskId: string): Promise<void> {
  await taskRepository.placeholder("deleteTask", { taskId });
}

export const taskService = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
