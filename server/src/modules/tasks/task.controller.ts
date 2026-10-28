import { asyncHandler } from "../../middleware/async-handler";
import { taskService } from "./task.service";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.types";

export const listTasks = asyncHandler(async (request, response) => {
  const result = await taskService.listTasks(
    request.auth!.userId,
    request.query as ListTasksQuery,
  );
  response.status(200).json(result);
});

export const createTask = asyncHandler(async (request, response) => {
  const task = await taskService.createTask(
    request.auth!.userId,
    request.body as CreateTaskInput,
  );
  response.status(201).json(task);
});

export const getTask = asyncHandler(async (request, response) => {
  const task = await taskService.getTask(
    request.auth!.userId,
    Number(request.params.taskId),
  );
  response.status(200).json(task);
});

export const updateTask = asyncHandler(async (request, response) => {
  const task = await taskService.updateTask(
    request.auth!.userId,
    Number(request.params.taskId),
    request.body as UpdateTaskInput,
  );
  response.status(200).json(task);
});

export const deleteTask = asyncHandler(async (request, response) => {
  await taskService.deleteTask(
    request.auth!.userId,
    Number(request.params.taskId),
  );
  response.status(204).end();
});
