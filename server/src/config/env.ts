import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new Error(`Invalid ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  port: Number(process.env.PORT ?? 3000),

  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",

  databaseUrl: requireEnv("DATABASE_URL"),

  redisUrl: requireEnv("REDIS_URL"),

  jwtSecret: requireEnv("JWT_SECRET"),

  authCookieName: process.env.AUTH_COOKIE_NAME ?? "auth_token",

  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",

  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: readPort("SMTP_PORT", 587),
  smtpSecure: (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
};
