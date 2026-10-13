import type { Response } from "express";

import { asyncHandler } from "../../middleware/async-handler";
import { taskService } from "./task.service";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.types";

function sendNotImplemented(response: Response, operation: string): void {
  response.status(501).json({
    code: "NOT_IMPLEMENTED",
    message: `${operation} API skeleton is wired. Business logic is not implemented yet.`,
  });
}

export const listTasks = asyncHandler(async (request, response) => {
  await taskService.listTasks(request.query as ListTasksQuery);
  sendNotImplemented(response, "List tasks");
});

export const createTask = asyncHandler(async (request, response) => {
  await taskService.createTask(request.body as CreateTaskInput);
  sendNotImplemented(response, "Create task");
});

export const getTask = asyncHandler(async (request, response) => {
  await taskService.getTask(String(request.params.taskId));
  sendNotImplemented(response, "Get task");
});

export const updateTask = asyncHandler(async (request, response) => {
  await taskService.updateTask(
    String(request.params.taskId),
    request.body as UpdateTaskInput,
  );
  sendNotImplemented(response, "Update task");
});

export const deleteTask = asyncHandler(async (request, response) => {
  await taskService.deleteTask(String(request.params.taskId));
  sendNotImplemented(response, "Delete task");
});
