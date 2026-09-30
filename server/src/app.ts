import express from "express";
import cors from "cors";

import { registerApiDocs } from "./config/api-docs";
import { env } from "./config/env";

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
