import { app } from "./app";
import { closeDatabase, connectDatabase } from "./db";
import { env } from "./config/env";
import {
  closeRedis,
  connectRedis,
} from "./integrations/redis/redis";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    console.log("Database connected");

    await connectRedis();
    console.log("Redis connected");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);

    process.exit(1);
  }
}

async function shutdown(): Promise<void> {
  console.log("Shutting down...");

  await Promise.allSettled([
    closeRedis(),
    closeDatabase(),
  ]);

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

void startServer();
