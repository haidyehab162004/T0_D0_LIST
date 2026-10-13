import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "./task.controller";
import {
  createTaskValidation,
  listTasksValidation,
  taskIdValidation,
  updateTaskValidation,
} from "./task.validation";

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get("/", validateRequest(listTasksValidation), listTasks);
taskRouter.post("/", validateRequest(createTaskValidation), createTask);
taskRouter.get("/:taskId", validateRequest(taskIdValidation), getTask);
taskRouter.patch("/:taskId", validateRequest(updateTaskValidation), updateTask);
taskRouter.delete("/:taskId", validateRequest(taskIdValidation), deleteTask);
