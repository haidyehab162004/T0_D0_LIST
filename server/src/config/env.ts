import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),

  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",

  databaseUrl: requireEnv("DATABASE_URL"),
};