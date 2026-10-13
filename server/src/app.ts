import express from "express";
import cors from "cors";

import { registerApiDocs } from "./config/api-docs";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { categoryRouter } from "./modules/categories/category.routes";
import { taskRouter } from "./modules/tasks/task.routes";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerApiDocs(app);

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/categories", categoryRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
